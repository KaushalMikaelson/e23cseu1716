import { Request, Response, NextFunction } from 'express';
import { Log } from 'logging_middleware';
import { fail } from '../utils/apiResponse';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  void Log('backend', 'error', 'middleware', `Unhandled exception on ${req.method} ${req.path}: ${err.message}`).catch(() => {});
  fail(res, 'An unexpected error occurred', 500);
}
