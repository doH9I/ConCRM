"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = exports.logWarn = exports.logError = exports.logInfo = exports.slowQueryLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'construction-manager-api' },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    logger.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    });
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        logger.info('Request completed', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
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
exports.requestLogger = requestLogger;
const slowQueryLogger = (threshold = 1000) => {
    return (req, res, next) => {
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
exports.slowQueryLogger = slowQueryLogger;
const logInfo = (message, meta) => {
    logger.info(message, meta);
};
exports.logInfo = logInfo;
const logError = (message, error, meta) => {
    logger.error(message, {
        error: error?.message,
        stack: error?.stack,
        ...meta
    });
};
exports.logError = logError;
const logWarn = (message, meta) => {
    logger.warn(message, meta);
};
exports.logWarn = logWarn;
const logDebug = (message, meta) => {
    logger.debug(message, meta);
};
exports.logDebug = logDebug;
exports.default = logger;
//# sourceMappingURL=logger.js.map