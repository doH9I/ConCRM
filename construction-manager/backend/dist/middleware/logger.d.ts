import { Response, NextFunction } from 'express';
import winston from 'winston';
import { AuthenticatedRequest } from '../types';
declare const logger: winston.Logger;
export declare const requestLogger: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const slowQueryLogger: (threshold?: number) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const logInfo: (message: string, meta?: any) => void;
export declare const logError: (message: string, error?: Error, meta?: any) => void;
export declare const logWarn: (message: string, meta?: any) => void;
export declare const logDebug: (message: string, meta?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map