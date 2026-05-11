import { Log } from 'logging_middleware';
import { ExternalNotification, Notification } from '../types';
import { MinHeap } from '../utils/minHeap';
import config from '../config';

// Priority weights per assignment spec
const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const TOP_K = 10;

/**
 * Computes a combined priority score.
 *
 * Formula: typeWeight / (hoursElapsed + 1)
 *
 * This favours high-weight types AND more recent notifications.
 * Two Placement notifications will be ranked by recency between themselves.
 */
function computePriority(notification: ExternalNotification): number {
  const weight = TYPE_WEIGHT[notification.type] ?? 1;
  const ageMs = Date.now() - new Date(notification.createdAt).getTime();
  const hoursElapsed = ageMs / (1000 * 60 * 60);
  return weight / (hoursElapsed + 1);
}

/**
 * Fetches all notifications from the evaluation service.
 */
async function fetchExternalNotifications(): Promise<ExternalNotification[]> {
  Log('backend', 'info', 'service', 'Fetching notifications from evaluation service');

  const response = await fetch(`${config.evaluationBaseUrl}/notifications`, {
    headers: {
      Authorization: `Bearer ${config.evaluationApiToken}`,
    },
  });

  if (!response.ok) {
    const msg = `Evaluation service returned ${response.status}`;
    Log('backend', 'error', 'service', msg);
    throw new Error(msg);
  }

  const data = (await response.json()) as ExternalNotification[];
  Log('backend', 'info', 'service', `Fetched ${data.length} notifications from evaluation service`);
  return data;
}

/**
 * Priority Inbox — returns the top 10 unread notifications ranked by priority.
 *
 * Algorithm: O(n log k) using a min-heap of size k.
 *   - Iterate all unread notifications (O(n))
 *   - Maintain a min-heap of size k (each push/pop is O(log k))
 *   - Result is the heap contents sorted descending
 */
export async function getTopPriorityNotifications(): Promise<Notification[]> {
  Log('backend', 'info', 'service', 'Computing priority inbox');

  const all = await fetchExternalNotifications();
  const unread = all.filter((n) => !n.isRead);

  Log('backend', 'debug', 'service', `${unread.length} unread notifications to rank`);

  const heap = new MinHeap<ExternalNotification>();

  for (const notification of unread) {
    const score = computePriority(notification);

    if (heap.size < TOP_K) {
      heap.push(notification, score);
    } else if (heap.peek() && score > heap.peek()!.priority) {
      // Current item outranks the heap minimum — swap it in
      heap.pop();
      heap.push(notification, score);
    }
  }

  // Extract and sort descending (highest priority first)
  const results: Array<{ item: ExternalNotification; priority: number }> = [];
  while (heap.size > 0) {
    const entry = heap.pop();
    if (entry) results.push(entry);
  }
  results.sort((a, b) => b.priority - a.priority);

  Log('backend', 'info', 'service', `Priority inbox computed — returning ${results.length} notifications`);

  return results.map((r) => r.item as Notification);
}
