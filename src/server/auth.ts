import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db, type StoredUser } from './db.js';
import type { Role, User } from '../types/index.js';

const JWT_SECRET = process.env.APP_SECRET || 'aiteebar_internal_secret_key_99218274';

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64);
    const storedHashBuf = Buffer.from(hash, 'hex');
    return crypto.timingSafeEqual(computedHash, storedHashBuf);
  } catch {
    return false;
  }
}

export function createToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.fullName,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyToken(token: string): { sub: string; email: string; role: Role; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function sanitizeUser(u: StoredUser): User {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  };
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    return next();
  }
  const data = db.getData();
  const user = data.users.find(u => u.id === payload.sub);
  if (user) {
    req.user = sanitizeUser(user);
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of roles: ${roles.join(', ')}. Current role: ${req.user.role}.` 
      });
    }
    next();
  };
}
