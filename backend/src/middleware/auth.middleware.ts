import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user.model';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: UserRole;
  };
  userId?: number;
  userRole?: UserRole;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default_secret';

    const decoded = jwt.verify(token, secret) as { userId: number; role: UserRole };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = { userId: decoded.userId, role: decoded.role };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

// Middleware para verificar si el usuario es administrador
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== UserRole.ADMIN) {
    return next(new AppError('Access denied. Admin role required.', 403));
  }
  next();
};
