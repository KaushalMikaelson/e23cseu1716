import { Request, Response } from 'express';
import { Log } from 'logging_middleware';
import * as notificationService from '../services/notificationService';
import { ok, fail } from '../utils/apiResponse';

export function getAll(req: Request, res: Response): void {
  void Log('backend', 'info', 'controller', `getAll — query: ${JSON.stringify(req.query)}`).catch(() => {});

  const result = notificationService.getAllNotifications({
    page: req.query.page,
    limit: req.query.limit,
    notification_type: req.query.notification_type,
  });

  ok(res, result);
  void Log('backend', 'info', 'controller', 'getAll responded successfully').catch(() => {});
}

export function getById(req: Request, res: Response): void {
  const { id } = req.params;
  void Log('backend', 'info', 'controller', `getById — id="${id}"`).catch(() => {});

  const notification = notificationService.getNotificationById(id);
  if (!notification) {
    void Log('backend', 'warn', 'controller', `getById — id="${id}" not found`).catch(() => {});
    fail(res, `Notification with id "${id}" not found`, 404);
    return;
  }

  ok(res, notification);
}

export function markRead(req: Request, res: Response): void {
  const { id } = req.params;
  void Log('backend', 'info', 'controller', `markRead — id="${id}"`).catch(() => {});

  const updated = notificationService.markAsRead(id);
  if (!updated) {
    void Log('backend', 'warn', 'controller', `markRead — id="${id}" not found`).catch(() => {});
    fail(res, `Notification with id "${id}" not found`, 404);
    return;
  }

  ok(res, updated);
  void Log('backend', 'info', 'controller', `markRead succeeded for id="${id}"`).catch(() => {});
}
