import React, { useEffect } from 'react';
import {
  Container, Typography, Divider, Box, Grid, Paper, Skeleton, Alert,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Log } from '../api/logger';
import { useNotificationContext } from '../state/useNotificationContext';
import PriorityInbox from '../components/PriorityInbox';
import NotificationCard from '../components/NotificationCard';

const Dashboard: React.FC = () => {
  const { notifications, loading, error, loadNotifications, loadPriorityInbox, markRead } =
    useNotificationContext();

  useEffect(() => {
    Log('frontend', 'info', 'page', 'Dashboard mounted');
    // Load first 4 notifications for the overview, plus priority inbox
    loadNotifications(1, '');
    loadPriorityInbox();
  }, [loadNotifications, loadPriorityInbox]);

  const recent = notifications.slice(0, 4);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          An overview of your campus notifications.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Priority inbox — left column on desktop */}
        <Grid item xs={12} md={6}>
          <PriorityInbox />
        </Grid>

        {/* Recent notifications — right column on desktop */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <NotificationsNoneIcon color="action" />
              <Typography variant="h6">Recent Notifications</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loading &&
              [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1.5 }} />
              ))}

            {error && (
              <Alert severity="error" variant="outlined">
                {error}
              </Alert>
            )}

            {!loading && !error && recent.length === 0 && (
              <Alert severity="info" variant="outlined">
                No notifications found.
              </Alert>
            )}

            {!loading &&
              recent.map((n) => (
                <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
              ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
