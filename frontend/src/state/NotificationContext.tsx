import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Notification, PaginatedNotifications, NotificationType } from '../api/types';
import { fetchNotifications, fetchPriorityInbox, markNotificationRead } from '../api/notifications';
import { Log } from '../api/logger';

export interface NotificationState {
  notifications: Notification[];
  meta: PaginatedNotifications['meta'] | null;
  page: number;
  filter: NotificationType | '';
  priorityInbox: Notification[];
  priorityN: number;
  loading: boolean;
  error: string | null;
  loadNotifications: (page?: number, filter?: NotificationType | '') => Promise<void>;
  loadPriorityInbox: (n?: number) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  setFilter: (type: NotificationType | '') => void;
  setPage: (page: number) => void;
  setPriorityN: (n: number) => void;
}

export const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<PaginatedNotifications['meta'] | null>(null);
  const [priorityInbox, setPriorityInbox] = useState<Notification[]>([]);
  const [priorityN, setPriorityN] = useState(10);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationType | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(
    async (p = page, f: NotificationType | '' = filter) => {
      setLoading(true);
      setError(null);
      void Log('frontend', 'info', 'state', `Loading notifications p=${p}`);
      try {
        const result = await fetchNotifications({ page: p, limit: 6, notification_type: f || undefined });
        setNotifications(result.data);
        setMeta(result.meta);
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        void Log('frontend', 'error', 'state', `Failed to load: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [page, filter],
  );

  const loadPriorityInbox = useCallback(async (n = priorityN) => {
    void Log('frontend', 'info', 'state', `Loading priority inbox n=${n}`);
    try {
      const result = await fetchPriorityInbox(n);
      setPriorityInbox(result.notifications);
    } catch (err) {
      void Log('frontend', 'error', 'state', `Priority inbox failed`);
    }
  }, [priorityN]);

  const markRead = useCallback(async (id: string) => {
    // Optimistic update — flip isRead immediately in both lists
    const updater = (n: Notification) => (n.id === id ? { ...n, isRead: true } : n);
    setNotifications((prev) => prev.map(updater));
    setPriorityInbox((prev) => prev.map(updater));

    try {
      // Persist to backend (mock store). External priority inbox IDs may 404 — that's fine.
      await markNotificationRead(id);
      void Log('frontend', 'info', 'state', `Notification ${id} marked read`);
    } catch {
      // External notifications aren't in the mock store — silently ignore 404.
      void Log('frontend', 'warn', 'state', `markRead: backend miss ${id}`);
    }
  }, []);

  const handleSetFilter = useCallback((type: NotificationType | '') => {
    void Log('frontend', 'info', 'state', `Filter → "${type}"`);
    setFilter(type);
    setPage(1);
  }, []);

  const handleSetPriorityN = useCallback((n: number) => {
    setPriorityN(n);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications, meta, page, filter,
        priorityInbox, priorityN,
        loading, error,
        loadNotifications, loadPriorityInbox, markRead,
        setFilter: handleSetFilter,
        setPage,
        setPriorityN: handleSetPriorityN,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
