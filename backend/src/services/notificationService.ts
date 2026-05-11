import { Notification, NotificationType } from '../types';
import { Log } from 'logging_middleware';
import { parsePagination, paginateArray } from '../utils/pagination';

// In-memory mock data — swap with a DB layer when ready
const notifications: Notification[] = [
  { id: '1', type: 'Placement', message: 'TCS hiring drive scheduled for 15th May at Main Auditorium.', isRead: false, createdAt: '2024-05-10T08:00:00Z' },
  { id: '2', type: 'Result', message: 'Semester 4 results have been declared. Check the student portal.', isRead: false, createdAt: '2024-05-09T12:00:00Z' },
  { id: '3', type: 'Event', message: 'Annual Tech Fest registrations are now open.', isRead: true, createdAt: '2024-05-08T09:00:00Z' },
  { id: '4', type: 'Placement', message: 'Infosys off-campus drive — apply before 18th May.', isRead: false, createdAt: '2024-05-07T10:30:00Z' },
  { id: '5', type: 'Result', message: 'Internal assessment marks uploaded for CSE-301.', isRead: true, createdAt: '2024-05-06T14:00:00Z' },
  { id: '6', type: 'Event', message: 'Guest lecture by Dr. Mehta on Machine Learning — 20th May.', isRead: false, createdAt: '2024-05-05T11:00:00Z' },
  { id: '7', type: 'Placement', message: 'Wipro recruitment process begins next week.', isRead: false, createdAt: '2024-05-04T09:00:00Z' },
  { id: '8', type: 'Result', message: 'Backlog examination schedule released on the notice board.', isRead: false, createdAt: '2024-05-03T08:30:00Z' },
  { id: '9', type: 'Event', message: 'Cultural committee meeting at 4pm in Room 203.', isRead: true, createdAt: '2024-05-02T13:00:00Z' },
  { id: '10', type: 'Placement', message: 'Accenture pre-placement talk on 22nd May — attendance mandatory.', isRead: false, createdAt: '2024-05-01T10:00:00Z' },
  { id: '11', type: 'Result', message: 'Project submission grades for CSE-401 are out.', isRead: false, createdAt: '2024-04-30T16:00:00Z' },
  { id: '12', type: 'Event', message: 'Sports day event postponed to 25th May.', isRead: false, createdAt: '2024-04-29T07:30:00Z' },
];

export interface GetAllOptions {
  page: unknown;
  limit: unknown;
  notification_type: unknown;
}

export function getAllNotifications(opts: GetAllOptions) {
  void Log('backend', 'info', 'service', 'Fetching all notifications').catch(() => {});

  const { page, limit, notification_type } = opts;
  const { page: p, limit: l } = parsePagination(page, limit);

  let filtered = [...notifications];

  if (notification_type) {
    filtered = filtered.filter((n) => n.type === (notification_type as NotificationType));
    void Log('backend', 'debug', 'service', `Filtered by type="${notification_type}" — ${filtered.length} results`).catch(() => {});
  }

  const result = paginateArray(filtered, p, l);
  void Log('backend', 'info', 'service', `Returning ${result.items.length} / ${result.meta.total}`).catch(() => {});
  return result;
}

export function getNotificationById(id: string): Notification | null {
  void Log('backend', 'info', 'service', `Looking up id="${id}"`).catch(() => {});
  return notifications.find((n) => n.id === id) ?? null;
}

export function markAsRead(id: string): Notification | null {
  void Log('backend', 'info', 'service', `Marking id="${id}" as read`).catch(() => {});
  const notification = notifications.find((n) => n.id === id);
  if (!notification) return null;
  notification.isRead = true;
  return notification;
}
