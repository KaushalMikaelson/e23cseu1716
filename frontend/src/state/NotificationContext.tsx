import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Notification, PaginatedNotifications, NotificationType } from '../api/types';
import { fetchNotifications, fetchPriorityInbox, markNotificationRead } from '../api/notifications';
import { Log } from '../api/logger';

interface NotificationState {
  // All notifications (paginated)
  notifications: Notification[];
  meta: PaginatedNotifications['meta'] | null;
  page: number;
  filter: NotificationType | '';
  // Priority inbox
  priorityInbox: Notification[];
  // Shared loading/error
  loading: boolean;
  error: string | null;
  // Actions
  loadNotifications: (page?: number, filter?: NotificationType | '') => Promise<void>;
  loadPriorityInbox: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  setFilter: (type: NotificationType | '') => void;
  setPage: (page: number) => void;
}

const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<PaginatedNotifications['meta'] | null>(null);
  const [priorityInbox, setPriorityInbox] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationType | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(
    async (p = page, f: NotificationType | '' = filter) => {
      setLoading(true);
      setError(null);
      Log('frontend', 'info', 'state', `Loading notifications — page=${p} filter="${f}"`);
      try {
        const result = await fetchNotifications({
          page: p,
          limit: 6,
          notification_type: f || undefined,
        });
        setNotifications(result.data);
        setMeta(result.meta);
        Log('frontend', 'info', 'state', `Loaded ${result.data.length} notifications`);
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        Log('frontend', 'error', 'state', `Failed to load notifications: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [page, filter],
  );

  const loadPriorityInbox = useCallback(async () => {
    Log('frontend', 'info', 'state', 'Loading priority inbox');
    try {
      const data = await fetchPriorityInbox();
      setPriorityInbox(data);
      Log('frontend', 'info', 'state', `Priority inbox loaded — ${data.length} items`);
    } catch (err) {
      Log('frontend', 'error', 'state', `Failed to load priority inbox: ${(err as Error).message}`);
      // Non-blocking — priority inbox failure should not crash the page
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    Log('frontend', 'info', 'state', `Marking notification ${id} as read`);
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n)),
      );
      setPriorityInbox((prev) =>
        prev.map((n) => (n.id === id ? updated : n)),
      );
      Log('frontend', 'info', 'state', `Notification ${id} marked as read`);
    } catch (err) {
      Log('frontend', 'error', 'state', `markRead failed for ${id}: ${(err as Error).message}`);
    }
  }, []);

  const handleSetFilter = useCallback((type: NotificationType | '') => {
    Log('frontend', 'info', 'state', `Filter changed to "${type}"`);
    setFilter(type);
    setPage(1);
  }, []);

  const handleSetPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        meta,
        page,
        filter,
        priorityInbox,
        loading,
        error,
        loadNotifications,
        loadPriorityInbox,
        markRead,
        setFilter: handleSetFilter,
        setPage: handleSetPage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationState {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used inside NotificationProvider');
  return ctx;
}
