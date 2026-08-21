import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
}

export function getTokenExpiration(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) throw new Error('Invalid expiration format');
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const now = new Date();
  switch (unit) {
    case 'd': return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h': return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm': return new Date(now.getTime() + value * 60 * 1000);
    case 's': return new Date(now.getTime() + value * 1000);
    default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}
