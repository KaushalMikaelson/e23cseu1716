import { Request, Response } from 'express';
import { Log } from 'logging_middleware';
import { getTopPriorityNotifications } from '../services/priorityInboxService';
import { ok, fail } from '../utils/apiResponse';

export async function getPriorityInbox(req: Request, res: Response): Promise<void> {
  Log('backend', 'info', 'controller', 'getPriorityInbox called');

  try {
    const notifications = await getTopPriorityNotifications();
    ok(res, notifications);
    Log('backend', 'info', 'controller', `getPriorityInbox responded with ${notifications.length} items`);
  } catch (err) {
    const message = (err as Error).message;
    Log('backend', 'error', 'controller', `getPriorityInbox failed: ${message}`);
    fail(res, 'Failed to fetch priority inbox', 502);
  }
}
