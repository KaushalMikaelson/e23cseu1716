import React from 'react';
import {
  Box, Typography, Divider, Skeleton, Alert, Paper,
} from '@mui/material';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { usePriorityInbox } from '../hooks/usePriorityInbox';
import NotificationCard from './NotificationCard';

const PriorityInbox: React.FC = () => {
  const { priorityInbox, markRead } = usePriorityInbox();

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <StarOutlineIcon color="warning" />
        <Typography variant="h6">Priority Inbox</Typography>
        <Typography variant="caption" color="text.secondary">
          (top 10 unread, ranked by type &amp; recency)
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {priorityInbox.length === 0 && (
        <Alert severity="info" variant="outlined">
          No unread priority notifications at the moment.
        </Alert>
      )}

      {priorityInbox.map((n) => (
        <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
      ))}
    </Paper>
  );
};

export const PriorityInboxSkeleton: React.FC = () => (
  <Box mb={4}>
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1.5 }} />
    ))}
  </Box>
);

export default PriorityInbox;
