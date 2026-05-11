import { useEffect } from 'react';
import { useNotificationContext } from '../state/NotificationContext';
import { NotificationType } from '../api/types';
import { Log } from '../api/logger';

export function useNotifications() {
  const ctx = useNotificationContext();

  useEffect(() => {
    void Log('frontend', 'debug', 'hook', `useNotifications — page=${ctx.page} filter="${ctx.filter}"`);
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
