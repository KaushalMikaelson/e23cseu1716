import { Request, Response, NextFunction } from 'express';
import { Log } from 'logging_middleware';
import { fail } from '../utils/apiResponse';
import { NotificationType } from '../types';

const ALLOWED_TYPES: NotificationType[] = ['Event', 'Result', 'Placement'];

export function validateNotificationQuery(req: Request, res: Response, next: NextFunction): void {
  const { notification_type } = req.query;

  if (notification_type && !ALLOWED_TYPES.includes(notification_type as NotificationType)) {
    void Log('backend', 'warn', 'middleware', `Invalid notification_type: "${notification_type}"`).catch(() => {});
    fail(res, `Invalid notification_type. Allowed: ${ALLOWED_TYPES.join(', ')}`, 400);
    return;
  }

  next();
}
