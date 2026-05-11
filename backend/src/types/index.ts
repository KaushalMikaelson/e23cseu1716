export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO 8601
}

// Shape returned by the evaluation service (uppercase keys as per API contract)
export interface ExternalNotification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string; // format: "2026-04-22 17:51:30"
}

export interface ExternalNotificationsResponse {
  notifications: ExternalNotification[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
