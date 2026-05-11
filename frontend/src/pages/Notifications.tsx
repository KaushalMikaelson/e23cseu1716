import React, { useEffect } from 'react';
import {
  Container, Typography, Box, Divider, Alert, Skeleton,
} from '@mui/material';
import { Log } from '../api/logger';
import { useNotifications } from '../hooks/useNotifications';
import NotificationCard from '../components/NotificationCard';
import FilterBar from '../components/FilterBar';
import PaginationControls from '../components/PaginationControls';

const Notifications: React.FC = () => {
  const {
    notifications, meta, page, filter, loading, error,
    markRead, changeFilter, changePage,
  } = useNotifications();

  useEffect(() => {
    Log('frontend', 'info', 'page', 'Notifications page mounted');
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          All Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse, filter, and mark notifications as read.
        </Typography>
      </Box>

      <FilterBar value={filter} onChange={changeFilter} />
      <Divider sx={{ my: 2.5 }} />

      {/* Loading skeletons */}
      {loading &&
        [1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1.5 }} />
        ))}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">
          No notifications match the selected filter.
        </Alert>
      )}

      {/* Notification list */}
      {!loading &&
        notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
        ))}

      {/* Pagination */}
      {meta && (
        <PaginationControls
          meta={meta}
          onPageChange={(p) => {
            Log('frontend', 'info', 'page', `Navigating to page ${p}`);
            changePage(p);
          }}
        />
      )}

      {meta && (
        <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={1}>
          {meta.total} total notification{meta.total !== 1 ? 's' : ''}
        </Typography>
      )}
    </Container>
  );
};

export default Notifications;
