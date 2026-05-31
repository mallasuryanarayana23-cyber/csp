import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
    studentProfileId?: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing or invalid' });
  }

  jwt.verify(token, env.JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Token authorization failed' });
    req.user = decoded;
    next();
  });
};

export const authorizeRoles = (allowedRoles: Array<'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
