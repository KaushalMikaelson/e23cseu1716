import { Log } from 'logging_middleware';
import { ExternalNotification, ExternalNotificationsResponse, Notification } from '../types';
import { MinHeap } from '../utils/minHeap';
import config from '../config';

// Type weights per assignment spec: Placement > Result > Event
const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Priority score = typeWeight / (hoursElapsed + 1)
 * Higher weight + more recent = higher score
 */
function computePriority(n: ExternalNotification): number {
  const weight = TYPE_WEIGHT[n.Type] ?? 1;
  // Timestamp from API: "2026-04-22 17:51:30" — parse as UTC
  const ts = new Date(n.Timestamp.replace(' ', 'T') + 'Z').getTime();
  const hoursElapsed = (Date.now() - ts) / (1000 * 60 * 60);
  return weight / (hoursElapsed + 1);
}

async function fetchExternalNotifications(): Promise<ExternalNotification[]> {
  Log('backend', 'info', 'service', 'Fetching notifications from evaluation service');

  const response = await fetch(`${config.evaluationBaseUrl}/notifications`, {
    headers: { Authorization: `Bearer ${config.evaluationApiToken}` },
  });

  if (!response.ok) {
    const msg = `Evaluation service returned ${response.status}`;
    Log('backend', 'error', 'service', msg);
    throw new Error(msg);
  }

  const json = (await response.json()) as ExternalNotificationsResponse;
  const notifications = json.notifications ?? [];
  Log('backend', 'info', 'service', `Fetched ${notifications.length} notifications from evaluation service`);
  return notifications;
}

/**
 * Returns top-n unread priority notifications.
 * All notifications from external API are treated as unread (no isRead field).
 *
 * Algorithm: O(n log k) using a min-heap of size k
 *   - Iterate all notifications: O(n)
 *   - Each heap op is O(log k)
 */
export async function getTopPriorityNotifications(topN: number): Promise<Notification[]> {
  Log('backend', 'info', 'service', `Computing priority inbox — top ${topN}`);

  const all = await fetchExternalNotifications();
  Log('backend', 'debug', 'service', `${all.length} total notifications to rank`);

  const heap = new MinHeap<ExternalNotification>();

  for (const notification of all) {
    const score = computePriority(notification);

    if (heap.size < topN) {
      heap.push(notification, score);
    } else if (heap.peek() && score > heap.peek()!.priority) {
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

  Log('backend', 'info', 'service', `Priority inbox ready — ${results.length} notifications`);

  // Map external shape → internal Notification shape
  return results.map((r) => ({
    id: r.item.ID,
    type: r.item.Type,
    message: r.item.Message,
    isRead: false, // external API has no isRead; treat all as unread
    createdAt: r.item.Timestamp.replace(' ', 'T') + 'Z',
  }));
}
