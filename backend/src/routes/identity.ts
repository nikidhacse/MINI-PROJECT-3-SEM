import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { signAppToken, verifyAuth, AuthenticatedRequest } from '../middleware/auth';
import { memoryStore } from '../db/memory_store';
import { query, pool, isConnected } from '../db/pool';

const router = Router();

// Schema validations
const ExchangeSchema = z.object({
  supabase_token: z.string().optional(),
  email: z.string().email().optional(),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  org_id: z.string().optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  target_role: z.enum(['creator', 'business']).optional().default('creator')
});

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().optional(),
  target_role: z.enum(['creator', 'business']).optional().default('creator')
});

const BootstrapSchema = z.object({
  org_name: z.string().min(2),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free')
});

const SwitchSchema = z.object({
  org_id: z.string().min(1)
});

// POST /identity/exchange
router.post('/exchange', async (req: Request, res: Response) => {
  try {
    const parse = ExchangeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid exchange parameters', code: 'VALIDATION_ERROR' });
    }

    const { supabase_token, email, full_name, avatar_url, org_id } = parse.data;

    let userEmail = email;
    let userName = full_name;
    let userAvatar = avatar_url;
    let supabaseUid = 'sub_' + (email ? Buffer.from(email).toString('hex').slice(0, 12) : 'guest');

    // If Supabase token provided, attempt server-side verification with Supabase
    if (supabase_token && process.env.SUPABASE_URL) {
      try {
        const verifyRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${supabase_token}`
          }
        });
        if (verifyRes.ok) {
          const u: any = await verifyRes.json();
          supabaseUid = u.id;
          userEmail = u.email || userEmail;
          userName = u.user_metadata?.full_name || userName;
          userAvatar = u.user_metadata?.avatar_url || userAvatar;
        }
      } catch (err: any) {
        console.warn('Supabase token verification network error, falling back:', err.message);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required for identity resolution', code: 'MISSING_EMAIL' });
    }

    // Try PostgreSQL resolve_identity if connected
    let identityResult: any = null;
    if (pool && isConnected) {
      try {
        const r = await query(
          'SELECT resolve_identity($1::text, $2::text, $3::text, $4::text, $5::uuid) as result',
          [supabaseUid, userEmail, userName || null, userAvatar || null, org_id || null]
        );
        if (r && r.rows && r.rows[0]) {
          identityResult = r.rows[0].result;
        }
      } catch (err: any) {
        console.warn('Postgres resolve_identity error:', err.message);
      }
    }

    if (!identityResult) {
      identityResult = memoryStore.resolveIdentity(supabaseUid, userEmail, userName, userAvatar, org_id);
    }

    if (identityResult.needs_onboarding) {
      // Auto-bootstrap creator studio for seamless experience
      const boot = memoryStore.bootstrapWorkspace(identityResult.user.id, `${userName || userEmail.split('@')[0]}'s Studio`, 'free');
      const activeOrg = boot.membership;
      const appToken = signAppToken({
        sub: identityResult.user.id,
        email: identityResult.user.email,
        full_name: identityResult.user.full_name,
        avatar_url: identityResult.user.avatar_url,
        org_id: activeOrg.org_id,
        org_name: activeOrg.org_name,
        role: activeOrg.role,
        plan: activeOrg.plan
      });

      return res.status(200).json({
        needs_onboarding: false,
        token: appToken,
        user: identityResult.user,
        memberships: [activeOrg],
        active_org: activeOrg
      });
    }

    const activeOrg = identityResult.active_org;
    const appToken = signAppToken({
      sub: identityResult.user.id,
      email: identityResult.user.email,
      full_name: identityResult.user.full_name,
      avatar_url: identityResult.user.avatar_url,
      org_id: activeOrg.org_id,
      org_name: activeOrg.org_name,
      role: activeOrg.role,
      plan: activeOrg.plan
    });

    return res.status(200).json({
      needs_onboarding: false,
      token: appToken,
      user: identityResult.user,
      memberships: identityResult.memberships,
      active_org: activeOrg
    });
  } catch (err: any) {
    console.error('Identity exchange failed:', err);
    return res.status(500).json({ error: 'Failed to exchange identity token', code: 'SERVER_ERROR' });
  }
});

// POST /identity/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Valid email and password (min 6 chars) required', code: 'VALIDATION_ERROR' });
    }

    const { email, target_role } = parse.data;
    const uid = 'usr_' + Buffer.from(email).toString('hex').slice(0, 10);
    const result = memoryStore.resolveIdentity(uid, email);

    if (result.needs_onboarding) {
      if (target_role === 'creator') {
        const boot = memoryStore.bootstrapWorkspace(result.user.id, `${result.user.full_name || email.split('@')[0]}'s Studio`, 'free');
        const active = boot.membership;
        const token = signAppToken({
          sub: result.user.id,
          email: result.user.email,
          full_name: result.user.full_name,
          avatar_url: result.user.avatar_url,
          org_id: active.org_id,
          org_name: active.org_name,
          role: active.role,
          plan: 'free'
        });

        return res.status(200).json({
          needs_onboarding: false,
          token,
          user: result.user,
          memberships: [active],
          active_org: active
        });
      }

      const token = signAppToken({ sub: result.user.id, email: result.user.email, full_name: result.user.full_name });
      return res.status(200).json({ needs_onboarding: true, token, user: result.user, memberships: [] });
    }

    let active = result.active_org;
    const allMemberships: any[] = [...result.memberships];
    if (target_role === 'creator') {
      let creatorOrg = allMemberships.find(m => m.plan === 'free');
      if (!creatorOrg) {
        // Auto-bootstrap a free creator workspace so creator login is guaranteed to enter Creator Studio
        const boot = memoryStore.bootstrapWorkspace(result.user.id, `${result.user.full_name || email.split('@')[0]}'s Creator Studio`, 'free');
        creatorOrg = boot.membership;
        allMemberships.push(creatorOrg);
      }
      active = creatorOrg;
    } else if (target_role === 'business') {
      let businessOrg = allMemberships.find(m => m.plan !== 'free');
      if (!businessOrg) {
        const boot = memoryStore.bootstrapWorkspace(result.user.id, `${result.user.full_name || email.split('@')[0]}'s Business`, 'pro');
        businessOrg = boot.membership;
        allMemberships.push(businessOrg);
      }
      active = businessOrg;
    }

    const token = signAppToken({
      sub: result.user.id,
      email: result.user.email,
      full_name: result.user.full_name,
      avatar_url: result.user.avatar_url,
      org_id: active?.org_id,
      org_name: active?.org_name,
      role: active?.role,
      plan: active?.plan
    });

    return res.status(200).json({
      needs_onboarding: false,
      token,
      user: result.user,
      memberships: allMemberships,
      active_org: active
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login failed', code: 'SERVER_ERROR' });
  }
});

// POST /identity/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const parse = SignupSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Valid email, password and name required', code: 'VALIDATION_ERROR' });
    }

    const { email, full_name, target_role } = parse.data;
    const uid = 'usr_' + Buffer.from(email).toString('hex').slice(0, 10);
    const result = memoryStore.resolveIdentity(uid, email, full_name);

    if (target_role === 'creator') {
      const boot = memoryStore.bootstrapWorkspace(result.user.id, `${full_name || email.split('@')[0]}'s Studio`, 'free');
      const active = boot.membership;
      const token = signAppToken({
        sub: result.user.id,
        email: result.user.email,
        full_name: result.user.full_name,
        avatar_url: result.user.avatar_url,
        org_id: active.org_id,
        org_name: active.org_name,
        role: active.role,
        plan: 'free'
      });

      return res.status(201).json({
        needs_onboarding: false,
        token,
        user: result.user,
        memberships: [active],
        active_org: active
      });
    }

    const token = signAppToken({
      sub: result.user.id,
      email: result.user.email,
      full_name: result.user.full_name,
      avatar_url: result.user.avatar_url
    });

    return res.status(201).json({
      needs_onboarding: true,
      token,
      user: result.user,
      memberships: []
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Signup failed', code: 'SERVER_ERROR' });
  }
});

// POST /identity/bootstrap (Protected)
router.post('/bootstrap', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = BootstrapSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Organization name required', code: 'VALIDATION_ERROR' });
    }

    const userId = req.user!.sub;
    const { org_name, plan } = parse.data;

    let bootResult: any = null;
    if (pool && isConnected) {
      try {
        const r = await query(
          'SELECT bootstrap_workspace($1::uuid, $2::text, $3::text) as result',
          [userId, org_name, plan]
        );
        if (r && r.rows && r.rows[0]) bootResult = r.rows[0].result;
      } catch (err: any) {
        console.warn('Postgres bootstrap_workspace error:', err.message);
      }
    }

    if (!bootResult) {
      bootResult = memoryStore.bootstrapWorkspace(userId, org_name, plan);
    }

    // Re-mint token with newly created organization as active
    const newClaims = {
      sub: userId,
      email: req.user!.email,
      full_name: req.user!.full_name,
      avatar_url: req.user!.avatar_url,
      org_id: bootResult.membership.org_id,
      org_name: bootResult.membership.org_name,
      role: bootResult.membership.role,
      plan: bootResult.membership.plan
    };

    const newToken = signAppToken(newClaims);

    return res.status(201).json({
      success: true,
      token: newToken,
      active_org: bootResult.membership,
      org: bootResult.org
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Workspace bootstrap failed', code: 'SERVER_ERROR' });
  }
});

// POST /identity/switch (Protected)
router.post('/switch', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = SwitchSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Target org_id required', code: 'VALIDATION_ERROR' });
    }

    const userId = req.user!.sub;
    const { org_id } = parse.data;

    let switchRes: any = null;
    if (pool && isConnected) {
      try {
        const r = await query(
          'SELECT switch_organization($1::uuid, $2::uuid) as result',
          [userId, org_id]
        );
        if (r && r.rows && r.rows[0]) switchRes = r.rows[0].result;
      } catch (err: any) {
        console.warn('Postgres switch_organization error:', err.message);
      }
    }

    if (!switchRes) {
      switchRes = memoryStore.switchOrganization(userId, org_id);
    }

    if (switchRes.error) {
      return res.status(403).json(switchRes);
    }

    const membership = switchRes.membership;
    const newToken = signAppToken({
      sub: userId,
      email: req.user!.email,
      full_name: req.user!.full_name,
      avatar_url: req.user!.avatar_url,
      org_id: membership.org_id,
      org_name: membership.org_name,
      role: membership.role,
      plan: membership.plan
    });

    return res.status(200).json({
      success: true,
      token: newToken,
      active_org: membership
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to switch organization', code: 'SERVER_ERROR' });
  }
});

export default router;
