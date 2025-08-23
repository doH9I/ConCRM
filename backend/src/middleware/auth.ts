import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errorHandler';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        first_name?: string;
        last_name?: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new UnauthorizedError('Access token required');
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      first_name: decoded.first_name,
      last_name: decoded.last_name
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    } else {
      throw new UnauthorizedError('Token verification failed');
    }
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without authentication
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      first_name: decoded.first_name,
      last_name: decoded.last_name
    };
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // For now, we'll implement a simple role system
    // In a real application, you'd have a roles table and check against it
    const userRole = 'user'; // Default role for now
    
    if (!roles.includes(userRole)) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  };
};

export const generateToken = (user: { id: number; email: string; first_name?: string; last_name?: string }): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    },
    secret,
    { expiresIn: '24h' }
  );
};