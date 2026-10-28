import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserClaims } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'aetherdesign-insecure-dev-secret-do-not-use-in-prod';

export interface AuthenticatedRequest extends Request {
  user?: UserClaims;
}

export function signAppToken(claims: Omit<UserClaims, 'exp'>, expiresIn: string = '24h'): string {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyAppToken(token: string): UserClaims | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserClaims;
  } catch (err) {
    return null;
  }
}

// Middleware: Authenticate request via Bearer token
export function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header. Expected Bearer token.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7).trim();
  const claims = verifyAppToken(token);

  if (!claims) {
    return res.status(401).json({
      error: 'Invalid or expired session token.',
      code: 'INVALID_TOKEN'
    });
  }

  req.user = claims;
  next();
}

// Middleware: Ensure user has an active organization
export function requireActiveOrg(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.org_id) {
    return res.status(403).json({
      error: 'Active organization required. Please complete onboarding or select a workspace.',
      code: 'NO_ACTIVE_ORG',
      needs_onboarding: true
    });
  }
  next();
}
