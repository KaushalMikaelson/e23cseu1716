import { Request, Response } from 'express';
import { Log } from 'logging_middleware';
import * as notificationService from '../services/notificationService';
import { ok, fail } from '../utils/apiResponse';

export function getAll(req: Request, res: Response): void {
  Log('backend', 'info', 'controller', `getAll called — query: ${JSON.stringify(req.query)}`);

  const result = notificationService.getAllNotifications({
    page: req.query.page,
    limit: req.query.limit,
    notification_type: req.query.notification_type,
  });

  ok(res, result);
  Log('backend', 'info', 'controller', 'getAll responded successfully');
}

export function getById(req: Request, res: Response): void {
  const { id } = req.params;
  Log('backend', 'info', 'controller', `getById called for id="${id}"`);

  const notification = notificationService.getNotificationById(id);

  if (!notification) {
    fail(res, `Notification with id "${id}" not found`, 404);
    return;
  }

  ok(res, notification);
  Log('backend', 'info', 'controller', `getById responded with notification id="${id}"`);
}

export function markRead(req: Request, res: Response): void {
  const { id } = req.params;
  Log('backend', 'info', 'controller', `markRead called for id="${id}"`);

  const updated = notificationService.markAsRead(id);

  if (!updated) {
    fail(res, `Notification with id "${id}" not found`, 404);
    return;
  }

  ok(res, updated);
  Log('backend', 'info', 'controller', `markRead succeeded for id="${id}"`);
}
