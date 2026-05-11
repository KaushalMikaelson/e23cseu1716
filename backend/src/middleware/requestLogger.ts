import { Request, Response, NextFunction } from 'express';
import { Log } from 'logging_middleware';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // void + .catch() — logging must never crash the server
  void Log('backend', 'info', 'middleware', `→ ${req.method} ${req.originalUrl}`).catch(() => {});

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    void Log('backend', level, 'middleware', `← ${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)`).catch(() => {});
  });

  next();
}
