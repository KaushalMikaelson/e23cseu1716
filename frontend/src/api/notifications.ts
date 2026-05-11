import request from './client';
import { Notification, PaginatedNotifications } from './types';

export interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  notification_type?: string;
}

export function fetchNotifications(params: FetchNotificationsParams = {}): Promise<PaginatedNotifications> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.notification_type) query.set('notification_type', params.notification_type);

  const qs = query.toString();
  return request<PaginatedNotifications>(`/notifications${qs ? `?${qs}` : ''}`);
}

export function fetchNotificationById(id: string): Promise<Notification> {
  return request<Notification>(`/notifications/${id}`);
}

export function markNotificationRead(id: string): Promise<Notification> {
  return request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export interface PriorityInboxResponse {
  notifications: Notification[];
  n: number;
}

export function fetchPriorityInbox(n = 10): Promise<PriorityInboxResponse> {
  return request<PriorityInboxResponse>(`/priority-inbox?n=${n}`);
}
