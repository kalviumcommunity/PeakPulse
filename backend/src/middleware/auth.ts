import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthRequest } from '../types/index.js';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
