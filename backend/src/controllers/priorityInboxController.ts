import { Request, Response } from 'express';
import { Log } from 'logging_middleware';
import { getTopPriorityNotifications } from '../services/priorityInboxService';
import { ok, fail } from '../utils/apiResponse';

const DEFAULT_N = 10;
const MAX_N = 50;

export async function getPriorityInbox(req: Request, res: Response): Promise<void> {
  // Support ?n=10 | 15 | 20 etc.
  const raw = parseInt(String(req.query.n ?? DEFAULT_N), 10);
  const topN = isNaN(raw) || raw < 1 ? DEFAULT_N : Math.min(raw, MAX_N);

  Log('backend', 'info', 'controller', `getPriorityInbox called — n=${topN}`);

  try {
    const notifications = await getTopPriorityNotifications(topN);
    ok(res, { notifications, n: topN });
    Log('backend', 'info', 'controller', `getPriorityInbox responded with ${notifications.length} items`);
  } catch (err) {
    const message = (err as Error).message;
    Log('backend', 'error', 'controller', `getPriorityInbox failed: ${message}`);
    fail(res, 'Failed to fetch priority inbox', 502);
  }
}
