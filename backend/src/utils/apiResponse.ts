import { Response } from 'express';
import { ApiSuccess, ApiError } from '../types';

export function ok<T>(res: Response, data: T, status = 200): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(status).json(body);
}

export function fail(res: Response, message: string, status = 500): Response {
  const body: ApiError = { success: false, message };
  return res.status(status).json(body);
}
