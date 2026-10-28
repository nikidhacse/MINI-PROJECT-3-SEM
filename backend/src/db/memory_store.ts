import fs from 'fs';
import path from 'path';
import { PlatformPreset, MembershipRole, PlanType, AssetStatus, CampaignStatus, ApprovalDecision, TicketStatus, TicketTopic, RagRetrieveResult } from '../types';

// In-Memory Database with Automatic Local Disk Persistence
export class MemoryStore {
  organizations: Map<string, any> = new Map();
  users: Map<string, any> = new Map();
  memberships: Map<string, any> = new Map();
  brand_kits: Map<string, any> = new Map();
  brand_chunks: Map<string, any> = new Map();
  campaigns: Map<string, any> = new Map();
  assets: Map<string, any> = new Map();
  asset_versions: Map<string, any> = new Map();
  approvals: Map<string, any> = new Map();
  templates: Map<string, any> = new Map();
  generation_jobs: Map<string, any> = new Map();
  support_tickets: Map<string, any> = new Map();
  platform_presets: Map<string, PlatformPreset> = new Map();

  constructor() {
    this.seedPlatformPresets();
    const loaded = this.loadFromDisk();
    if (!loaded) {
      this.seedDefaults();
    }
  }

  private getStoragePath(): string {
    const dataDir = process.env.VERCEL ? '/tmp' : path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {}
    }
    return path.join(dataDir, 'store.json');
  }

  saveToDisk() {
    try {
      const filePath = this.getStoragePath();
      const payload = {
        organizations: Array.from(this.organizations.entries()),
        users: Array.from(this.users.entries()),
        memberships: Array.from(this.memberships.entries()),
        brand_kits: Array.from(this.brand_kits.entries()),
        brand_chunks: Array.from(this.brand_chunks.entries()),
        campaigns: Array.from(this.campaigns.entries()),
        assets: Array.from(this.assets.entries()),
        asset_versions: Array.from(this.asset_versions.entries()),
        approvals: Array.from(this.approvals.entries()),
        templates: Array.from(this.templates.entries()),
        generation_jobs: Array.from(this.generation_jobs.entries()),
        support_tickets: Array.from(this.support_tickets.entries()),
      };
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err: any) {
      console.warn('Failed to save memoryStore to disk:', err.message);
    }
  }

  loadFromDisk(): boolean {
    try {
      const filePath = this.getStoragePath();
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const payload = JSON.parse(content);
        if (payload.organizations) this.organizations = new Map(payload.organizations);
        if (payload.users) this.users = new Map(payload.users);
        if (payload.memberships) this.memberships = new Map(payload.memberships);
        if (payload.brand_kits) this.brand_kits = new Map(payload.brand_kits);
        if (payload.brand_chunks) this.brand_chunks = new Map(payload.brand_chunks);
        if (payload.campaigns) this.campaigns = new Map(payload.campaigns);
        if (payload.assets) this.assets = new Map(payload.assets);
        if (payload.asset_versions) this.asset_versions = new Map(payload.asset_versions);
        if (payload.approvals) this.approvals = new Map(payload.approvals);
        if (payload.templates && payload.templates.length > 0) this.templates = new Map(payload.templates);
        if (payload.generation_jobs) this.generation_jobs = new Map(payload.generation_jobs);
        if (payload.support_tickets) this.support_tickets = new Map(payload.support_tickets);
        console.log(`💾 Loaded persistent store from disk: ${this.users.size} users, ${this.assets.size} assets, ${this.organizations.size} workspaces.`);
        return true;
      }
    } catch (err: any) {
      console.warn('Failed to load memoryStore from disk:', err.message);
    }
    return false;
  }

  private seedPlatformPresets() {
    const presets: PlatformPreset[] = [
      { key: 'instagram_square', label: 'Instagram Post', width: 1080, height: 1080, aspect: '1:1', description: 'Standard square post optimized for feed visibility' },
      { key: 'instagram_story', label: 'Instagram Story', width: 1080, height: 1920, aspect: '9:16', description: 'Full screen vertical format for stories and reels' },
      { key: 'facebook_link', label: 'Facebook Link', width: 1200, height: 630, aspect: '16:9', description: 'Landscape banner optimized for Facebook feeds & link previews' },
      { key: 'linkedin_post', label: 'LinkedIn Post', width: 1200, height: 1200, aspect: '1:1', description: 'High resolution square format for LinkedIn professional feed' },
      { key: 'email_banner', label: 'Email Banner', width: 1200, height: 400, aspect: '3:1', description: 'Wide header banner for email marketing campaigns' },
      { key: 'web_hero', label: 'Website Hero', width: 1600, height: 600, aspect: '8:3', description: 'Ultra-wide banner for website landing hero sections' },
      { key: 'pinterest_pin', label: 'Pinterest Pin', width: 1000, height: 1500, aspect: '2:3', description: 'High-engagement portrait pin for Pinterest boards' }
    ];
    presets.forEach(p => this.platform_presets.set(p.key, p));
  }

  private seedDefaults() {
    // Seed default public templates
    this.templates.set('tpl-1', {
      id: 'tpl-1',
      org_id: null,
      title: 'Minimal Product Showcase',
      category: 'Social Media',
      spec: {
        elements: [
          { type: 'text', content: 'SUMMER COLLECTION', fontSize: 48, color: '#2D1B69', fontFamily: 'Poppins', x: 100, y: 150 },
          { type: 'text', content: 'Now Available Online', fontSize: 24, color: '#6B7280', fontFamily: 'Poppins', x: 100, y: 230 }
        ]
      },
      preview_path: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      is_public: true,
      created_at: new Date().toISOString()
    });

    this.templates.set('tpl-2', {
      id: 'tpl-2',
      org_id: null,
      title: 'Tech Webinar Hero',
      category: 'Banner',
      spec: {
        elements: [
          { type: 'text', content: 'NEXT-GEN AI WORKFLOWS', fontSize: 52, color: '#8B5CF6', fontFamily: 'Poppins', x: 80, y: 120 },
          { type: 'text', content: 'Join us live this Thursday', fontSize: 22, color: '#2D1B69', fontFamily: 'Poppins', x: 80, y: 200 }
        ]
      },
      preview_path: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
      is_public: true,
      created_at: new Date().toISOString()
    });

    this.templates.set('tpl-3', {
      id: 'tpl-3',
      org_id: null,
      title: 'Creative Brand Announcement',
      category: 'Poster',
      spec: {
        elements: [
          { type: 'text', content: 'BIG NEWS AHEAD', fontSize: 60, color: '#2D1B69', fontFamily: 'Poppins', x: 100, y: 180 },
          { type: 'text', content: 'Stay tuned for what is coming next', fontSize: 24, color: '#8B5CF6', fontFamily: 'Poppins', x: 100, y: 270 }
        ]
      },
      preview_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      is_public: true,
      created_at: new Date().toISOString()
    });

    this.templates.set('tpl-4', {
      id: 'tpl-4',
      org_id: null,
      title: 'SaaS Growth Story',
      category: 'Marketing',
      spec: {
        elements: [
          { type: 'text', content: '10X YOUR DESIGN VELOCITY', fontSize: 44, color: '#2D1B69', fontFamily: 'Poppins', x: 90, y: 160 },
          { type: 'text', content: 'Automated brand consistency', fontSize: 20, color: '#7C3AED', fontFamily: 'Poppins', x: 90, y: 230 }
        ]
      },
      preview_path: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      is_public: true,
      created_at: new Date().toISOString()
    });
  }

  // Identity resolution
  resolveIdentity(supabaseUid: string, email: string, fullName?: string, avatarUrl?: string, orgId?: string) {
    let user = Array.from(this.users.values()).find(u => u.supabase_user_id === supabaseUid || u.email === email.toLowerCase());

    if (!user) {
      user = {
        id: 'usr-' + Math.random().toString(36).substring(2, 10),
        email: email.toLowerCase(),
        full_name: fullName || email.split('@')[0],
        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || email)}`,
        supabase_user_id: supabaseUid,
        auth_provider: 'supabase',
        created_at: new Date().toISOString()
      };
      this.users.set(user.id, user);
      this.saveToDisk();
    } else {
      let changed = false;
      if (fullName && !user.full_name) { user.full_name = fullName; changed = true; }
      if (avatarUrl && !user.avatar_url) { user.avatar_url = avatarUrl; changed = true; }
      if (supabaseUid && !user.supabase_user_id) { user.supabase_user_id = supabaseUid; changed = true; }
      if (changed) this.saveToDisk();
    }

    // Get user memberships
    const userMemberships = Array.from(this.memberships.values())
      .filter(m => m.user_id === user.id)
      .map(m => {
        const org = this.organizations.get(m.org_id);
        return {
          id: m.id,
          org_id: m.org_id,
          org_name: org?.name || 'Workspace',
          slug: org?.slug || 'workspace',
          plan: org?.plan || 'free',
          role: m.role
        };
      });

    if (userMemberships.length === 0) {
      return {
        needs_onboarding: true,
        user,
        memberships: []
      };
    }

    let activeOrg = orgId ? userMemberships.find(m => m.org_id === orgId) : userMemberships[0];
    if (!activeOrg) activeOrg = userMemberships[0];

    return {
      needs_onboarding: false,
      user,
      memberships: userMemberships,
      active_org: activeOrg
    };
  }

  // Bootstrap workspace
  bootstrapWorkspace(userId: string, orgName: string, plan: PlanType = 'free') {
    const orgId = 'org-' + Math.random().toString(36).substring(2, 10);
    const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace';
    let slug = baseSlug;
    let counter = 1;
    while (Array.from(this.organizations.values()).some(o => o.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const org = {
      id: orgId,
      name: orgName,
      slug,
      plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.organizations.set(orgId, org);

    const membershipId = 'mem-' + Math.random().toString(36).substring(2, 10);
    const membership = {
      id: membershipId,
      user_id: userId,
      org_id: orgId,
      role: 'owner' as MembershipRole,
      created_at: new Date().toISOString()
    };
    this.memberships.set(membershipId, membership);

    // Create default brand kit
    const brandKitId = 'bk-' + Math.random().toString(36).substring(2, 10);
    const brandKit = {
      id: brandKitId,
      org_id: orgId,
      name: `${orgName} Brand Kit`,
      tokens: {
        colors: { primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#A78BFA' },
        fonts: { heading: 'Poppins', body: 'Poppins' },
        tone: 'clear, practical, warm'
      },
      guidelines_text: '',
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.brand_kits.set(brandKitId, brandKit);
    this.saveToDisk();

    return {
      success: true,
      org,
      membership: {
        id: membership.id,
        org_id: org.id,
        org_name: org.name,
        slug: org.slug,
        plan: org.plan,
        role: membership.role
      }
    };
  }

  // Switch organization
  switchOrganization(userId: string, targetOrgId: string) {
    const membership = Array.from(this.memberships.values()).find(
      m => m.user_id === userId && m.org_id === targetOrgId
    );
    if (!membership) {
      return { error: 'User is not a member of the target organization', code: 'FORBIDDEN' };
    }
    const org = this.organizations.get(targetOrgId);
    return {
      success: true,
      membership: {
        id: membership.id,
        org_id: org.id,
        org_name: org.name,
        slug: org.slug,
        plan: org.plan,
        role: membership.role
      }
    };
  }

  // Security Definer write handler
  apiWrite(orgId: string, userId: string, role: MembershipRole, resource: string, op: 'create' | 'update' | 'delete', id?: string, data: any = {}) {
    // 1. Campaigns
    if (resource === 'campaigns') {
      if (op === 'create' || op === 'update') {
        if (!['marketing_manager', 'brand_admin', 'owner'].includes(role)) {
          return { error: 'Insufficient permissions to modify campaigns', code: 'FORBIDDEN' };
        }
        if (op === 'create') {
          const item = {
            id: 'cmp-' + Math.random().toString(36).substring(2, 10),
            org_id: orgId,
            name: data.name || 'Untitled Campaign',
            brief: data.brief || '',
            audience: data.audience || '',
            platform: data.platform || 'instagram_square',
            status: data.status || 'draft',
            deadline: data.deadline || null,
            brand_kit_id: data.brand_kit_id || null,
            assigned_to: data.assigned_to || null,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.campaigns.set(item.id, item);
          this.saveToDisk();
          return { success: true, data: item };
        } else {
          const existing = this.campaigns.get(id!);
          if (!existing || existing.org_id !== orgId) {
            return { error: 'Campaign not found in active organization', code: 'NOT_FOUND' };
          }
          const updated = { ...existing, ...data, org_id: orgId, updated_at: new Date().toISOString() };
          this.campaigns.set(id!, updated);
          this.saveToDisk();
          return { success: true, data: updated };
        }
      } else if (op === 'delete') {
        if (!['brand_admin', 'owner'].includes(role)) {
          return { error: 'Only Brand Admin and Owner can delete campaigns', code: 'FORBIDDEN' };
        }
        const existing = this.campaigns.get(id!);
        if (!existing || existing.org_id !== orgId) {
          return { error: 'Campaign not found in active organization', code: 'NOT_FOUND' };
        }
        this.campaigns.delete(id!);
        this.saveToDisk();
        return { success: true, data: existing };
      }
    }

    // 2. Assets
    if (resource === 'assets') {
      if (op === 'create' || op === 'update') {
        if (!['designer', 'marketing_manager', 'brand_admin', 'owner'].includes(role)) {
          return { error: 'Insufficient permissions to modify assets', code: 'FORBIDDEN' };
        }
        if (op === 'create') {
          const item = {
            id: 'ast-' + Math.random().toString(36).substring(2, 10),
            org_id: orgId,
            campaign_id: data.campaign_id || null,
            brand_kit_id: data.brand_kit_id || null,
            title: data.title || 'Untitled Asset',
            description: data.description || '',
            category: data.category || 'Social Media',
            status: data.status || 'draft',
            current_version: data.current_version || 1,
            width: data.width || 1080,
            height: data.height || 1080,
            storage_path: data.storage_path || '',
            thumbnail_path: data.thumbnail_path || data.storage_path || '',
            quality_score: data.quality_score || 95,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.assets.set(item.id, item);

          // Version record
          const versionId = 'ver-' + Math.random().toString(36).substring(2, 10);
          this.asset_versions.set(versionId, {
            id: versionId,
            asset_id: item.id,
            org_id: orgId,
            version_no: 1,
            storage_path: item.storage_path,
            prompt: data.prompt || '',
            negative_prompt: data.negative_prompt || '',
            model: data.model || 'flux-1-schnell',
            params: data.params || {},
            locale: data.locale || 'en',
            quality_score: item.quality_score,
            created_at: new Date().toISOString()
          });

          this.saveToDisk();
          return { success: true, data: item };
        } else {
          const existing = this.assets.get(id!);
          if (!existing || existing.org_id !== orgId) {
            return { error: 'Asset not found in active organization', code: 'NOT_FOUND' };
          }
          const updated = { ...existing, ...data, org_id: orgId, updated_at: new Date().toISOString() };
          this.assets.set(id!, updated);
          this.saveToDisk();
          return { success: true, data: updated };
        }
      } else if (op === 'delete') {
        if (!['brand_admin', 'owner'].includes(role)) {
          return { error: 'Only Brand Admin and Owner can delete assets', code: 'FORBIDDEN' };
        }
        const existing = this.assets.get(id!);
        if (!existing || existing.org_id !== orgId) {
          return { error: 'Asset not found in active organization', code: 'NOT_FOUND' };
        }
        this.assets.delete(id!);
        this.saveToDisk();
        return { success: true, data: existing };
      }
    }

    // 3. Brand Kits
    if (resource === 'brand_kits') {
      if (op === 'create' || op === 'update') {
        if (!['brand_admin', 'owner'].includes(role)) {
          return { error: 'Only Brand Admin and Owner can modify brand kits', code: 'FORBIDDEN' };
        }
        if (op === 'create') {
          const item = {
            id: 'bk-' + Math.random().toString(36).substring(2, 10),
            org_id: orgId,
            name: data.name || 'Brand Kit',
            tokens: data.tokens || { colors: { primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#A78BFA' }, fonts: { heading: 'Poppins', body: 'Poppins' }, tone: 'clear, practical, warm' },
            guidelines_text: data.guidelines_text || '',
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.brand_kits.set(item.id, item);
          this.saveToDisk();
          return { success: true, data: item };
        } else {
          const existing = this.brand_kits.get(id!);
          if (!existing || existing.org_id !== orgId) {
            return { error: 'Brand kit not found in active organization', code: 'NOT_FOUND' };
          }
          const updated = { ...existing, ...data, org_id: orgId, updated_at: new Date().toISOString() };
          this.brand_kits.set(id!, updated);
          this.saveToDisk();
          return { success: true, data: updated };
        }
      } else if (op === 'delete') {
        if (role !== 'owner') {
          return { error: 'Only Organization Owner can delete brand kits', code: 'FORBIDDEN' };
        }
        const existing = this.brand_kits.get(id!);
        if (!existing || existing.org_id !== orgId) {
          return { error: 'Brand kit not found in active organization', code: 'NOT_FOUND' };
        }
        this.brand_kits.delete(id!);
        this.saveToDisk();
        return { success: true, data: existing };
      }
    }

    // 4. Templates
    if (resource === 'templates') {
      if (op === 'create' || op === 'update') {
        if (!['brand_admin', 'owner'].includes(role)) {
          return { error: 'Only Brand Admin and Owner can modify templates', code: 'FORBIDDEN' };
        }
        if (op === 'create') {
          const item = {
            id: 'tpl-' + Math.random().toString(36).substring(2, 10),
            org_id: orgId,
            title: data.title || 'New Template',
            category: data.category || 'Social Media',
            spec: data.spec || {},
            preview_path: data.preview_path || '',
            is_public: false,
            created_at: new Date().toISOString()
          };
          this.templates.set(item.id, item);
          this.saveToDisk();
          return { success: true, data: item };
        } else {
          const existing = this.templates.get(id!);
          if (!existing || (existing.org_id !== orgId && !existing.is_public)) {
            return { error: 'Template not found in active organization', code: 'NOT_FOUND' };
          }
          const updated = { ...existing, ...data, org_id: orgId };
          this.templates.set(id!, updated);
          this.saveToDisk();
          return { success: true, data: updated };
        }
      } else if (op === 'delete') {
        if (role !== 'owner') {
          return { error: 'Only Organization Owner can delete templates', code: 'FORBIDDEN' };
        }
        const existing = this.templates.get(id!);
        if (!existing || existing.org_id !== orgId) {
          return { error: 'Template not found in active organization', code: 'NOT_FOUND' };
        }
        this.templates.delete(id!);
        this.saveToDisk();
        return { success: true, data: existing };
      }
    }

    return { error: `Unsupported resource: ${resource}`, code: 'BAD_REQUEST' };
  }

  // RAG Upsert Chunk
  ragUpsertChunk(orgId: string, brandKitId: string, chunkIndex: number, content: string, embedding: number[]) {
    const brandKit = this.brand_kits.get(brandKitId);
    if (!brandKit || brandKit.org_id !== orgId) {
      return { error: 'Brand kit not found in caller organization', code: 'NOT_FOUND' };
    }

    if (chunkIndex === 0) {
      // Idempotently clear prior chunks for this brand kit
      Array.from(this.brand_chunks.entries()).forEach(([id, chunk]) => {
        if (chunk.brand_kit_id === brandKitId && chunk.org_id === orgId) {
          this.brand_chunks.delete(id);
        }
      });
    }

    const chunkId = 'chk-' + Math.random().toString(36).substring(2, 10);
    const chunk = {
      id: chunkId,
      brand_kit_id: brandKitId,
      org_id: orgId,
      chunk_index: chunkIndex,
      content,
      embedding,
      created_at: new Date().toISOString()
    };
    this.brand_chunks.set(chunkId, chunk);
    return { success: true, chunk_id: chunkId, chunk_index: chunkIndex };
  }

  // In-Memory Cosine Similarity Calculation
  static cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // RAG Retrieve with Dual Confidence Rule
  ragRetrieve(orgId: string, queryEmbedding: number[], limit: number = 6): RagRetrieveResult {
    const clampedLimit = Math.max(1, Math.min(limit || 6, 20));

    const orgChunks = Array.from(this.brand_chunks.values())
      .filter(c => c.org_id === orgId && Array.isArray(c.embedding))
      .map(c => ({
        ...c,
        similarity: parseFloat(MemoryStore.cosineSimilarity(queryEmbedding, c.embedding).toFixed(4))
      }))
      .sort((a, b) => b.similarity - a.similarity);

    const topChunks = orgChunks.slice(0, clampedLimit);
    const topSimilarity = topChunks.length > 0 ? topChunks[0].similarity : 0;
    const secondSimilarity = topChunks.length > 1 ? topChunks[1].similarity : 0;
    const gap = topChunks.length === 0 ? 0 : topChunks.length === 1 ? topSimilarity : parseFloat((topSimilarity - secondSimilarity).toFixed(4));

    // Dual Confidence Rule: gap >= 0.03 OR top_similarity >= 0.85
    const confident = topSimilarity > 0 && (gap >= 0.03 || topSimilarity >= 0.85);

    return {
      chunks: topChunks.map(c => ({
        id: c.id,
        brand_kit_id: c.brand_kit_id,
        chunk_index: c.chunk_index,
        content: c.content,
        similarity: c.similarity
      })),
      top_similarity: topSimilarity,
      gap: gap,
      confident: confident
    };
  }
}

export const memoryStore = new MemoryStore();
