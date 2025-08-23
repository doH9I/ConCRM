import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', error);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  if (error instanceof Error) {
    message = error.message;
  }

  if ('status' in error && typeof error.status === 'number') {
    statusCode = error.status;
  }

  if ('code' in error && typeof error.code === 'string') {
    code = error.code;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    code = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    code = 'NOT_FOUND';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    code = 'CONFLICT';
  }

  const errorResponse: ApiError = {
    message,
    code,
    status: statusCode,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  res.status(statusCode).json({
    success: false,
    error: errorResponse
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const error: ApiError = {
    message: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
    status: 404
  };

  res.status(404).json({
    success: false,
    error
  });
};

// Custom error classes
export class ValidationError extends Error {
  public status: number;
  public code: string;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'VALIDATION_ERROR';
  }
}

export class UnauthorizedError extends Error {
  public status: number;
  public code: string;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
    this.code = 'UNAUTHORIZED';
  }
}

export class ForbiddenError extends Error {
  public status: number;
  public code: string;

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
    this.code = 'FORBIDDEN';
  }
}

export class NotFoundError extends Error {
  public status: number;
  public code: string;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.code = 'NOT_FOUND';
  }
}

export class ConflictError extends Error {
  public status: number;
  public code: string;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
    this.code = 'CONFLICT';
  }
}