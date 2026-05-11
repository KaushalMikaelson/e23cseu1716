import { useEffect } from 'react';
import { useNotificationContext } from '../state/NotificationContext';
import { Log } from '../api/logger';

/**
 * Fetches priority inbox on mount and exposes the result.
 */
export function usePriorityInbox() {
  const { priorityInbox, loadPriorityInbox, markRead } = useNotificationContext();

  useEffect(() => {
    Log('frontend', 'debug', 'hook', 'usePriorityInbox mounted — fetching inbox');
    loadPriorityInbox();
  }, [loadPriorityInbox]);

  return { priorityInbox, markRead };
}
