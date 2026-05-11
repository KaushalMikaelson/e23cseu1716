import { Request, Response, NextFunction } from 'express';
import { Log } from 'logging_middleware';

/**
 * Logs every incoming request — method, path, and status on response finish.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  Log('backend', 'info', 'middleware', `→ ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    Log('backend', level, 'middleware', `← ${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)`);
  });

  next();
}
