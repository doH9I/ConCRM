"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.AppError = exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        statusCode,
        url: req.originalUrl,
        method: req.method,
        user: req.user?.id,
        timestamp: new Date().toISOString()
    });
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    }
    else if (error.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
    }
    else if (error.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
    }
    else if (error.name === 'TooManyRequestsError') {
        statusCode = 429;
        message = 'Too many requests';
    }
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
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const createError = (message, statusCode = 500) => {
    return new AppError(message, statusCode);
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map