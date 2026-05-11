import { useEffect } from 'react';
import { useNotificationContext } from '../state/useNotificationContext';
import { Log } from '../api/logger';

export function usePriorityInbox() {
  const { priorityInbox, priorityN, loadPriorityInbox, markRead } = useNotificationContext();

  useEffect(() => {
    void Log('frontend', 'debug', 'hook', `usePriorityInbox mounted — n=${priorityN}`);
    void loadPriorityInbox(priorityN);
  }, [loadPriorityInbox, priorityN]);

  return { priorityInbox, markRead };
}
