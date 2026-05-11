import { useEffect } from 'react';
import { useNotificationContext } from '../state/NotificationContext';
import { NotificationType } from '../api/types';
import { Log } from '../api/logger';

/**
 * Wraps the notification context and triggers a fetch whenever
 * page or filter changes. Components just call this hook and
 * get back the data — no manual effect wiring needed.
 */
export function useNotifications() {
  const ctx = useNotificationContext();

  useEffect(() => {
    Log('frontend', 'debug', 'hook', `useNotifications effect — page=${ctx.page} filter="${ctx.filter}"`);
    ctx.loadNotifications(ctx.page, ctx.filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.page, ctx.filter]);

  const changeFilter = (type: NotificationType | '') => {
    ctx.setFilter(type);
  };

  const changePage = (page: number) => {
    ctx.setPage(page);
  };

  return {
    notifications: ctx.notifications,
    meta: ctx.meta,
    page: ctx.page,
    filter: ctx.filter,
    loading: ctx.loading,
    error: ctx.error,
    markRead: ctx.markRead,
    changeFilter,
    changePage,
  };
}
