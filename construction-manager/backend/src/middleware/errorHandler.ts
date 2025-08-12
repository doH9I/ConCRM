import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Логируем ошибку
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Обработка специфических ошибок
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource conflict';
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429;
    message = 'Too many requests';
  }

  // В production не показываем детали внутренних ошибок
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong!';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode = 500) => {
  return new AppError(message, statusCode);
};