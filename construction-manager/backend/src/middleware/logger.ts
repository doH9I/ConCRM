import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { AuthenticatedRequest } from '../types';

// Настройка Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'construction-manager-api' },
  transports: [
    // Файл для ошибок
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Файл для всех логов
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// В development также выводим в консоль
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Middleware для логирования запросов
export const requestLogger = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  // Логируем входящий запрос
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Перехватываем окончание ответа
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Логируем ответ
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    // Если ошибка, логируем дополнительную информацию
    if (res.statusCode >= 400) {
      logger.error('Request error', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id,
        response: data,
        timestamp: new Date().toISOString()
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Middleware для логирования медленных запросов
export const slowQueryLogger = (threshold = 1000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > threshold) {
        logger.warn('Slow query detected', {
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        });
      }
    });

    next();
  };
};

// Функции для логирования в других частях приложения
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...meta
  });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export default logger;