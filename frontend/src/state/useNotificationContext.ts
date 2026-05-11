import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';
import type { NotificationState } from './NotificationContext';

export type { NotificationState };

export function useNotificationContext(): NotificationState {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used inside NotificationProvider');
  return ctx;
}
