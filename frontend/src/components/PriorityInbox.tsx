import React from 'react';
import {
  Box, Typography, Divider, Alert, Paper,
  ToggleButton, ToggleButtonGroup, Tooltip,
} from '@mui/material';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { useNotificationContext } from '../state/NotificationContext';
import { usePriorityInbox } from '../hooks/usePriorityInbox';
import NotificationCard from './NotificationCard';

const N_OPTIONS = [10, 15, 20];

const PriorityInbox: React.FC = () => {
  const { priorityInbox, markRead } = usePriorityInbox();
  const { priorityN, setPriorityN, loadPriorityInbox } = useNotificationContext();

  const handleNChange = (_: React.MouseEvent<HTMLElement>, value: number | null) => {
    if (!value) return;
    setPriorityN(value);
    void loadPriorityInbox(value);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <StarOutlineIcon color="warning" />
          <Typography variant="h6">Priority Inbox</Typography>
        </Box>

        {/* Top-n selector */}
        <Tooltip title="Number of top priority notifications to show">
          <ToggleButtonGroup
            value={priorityN}
            exclusive
            onChange={handleNChange}
            size="small"
            color="warning"
            aria-label="top n notifications"
          >
            {N_OPTIONS.map((n) => (
              <ToggleButton key={n} value={n} id={`priority-n-${n}`}>
                Top {n}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Tooltip>
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Ranked by type weight (Placement &gt; Result &gt; Event) &amp; recency
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {priorityInbox.length === 0 && (
        <Alert severity="info" variant="outlined">
          No priority notifications at the moment.
        </Alert>
      )}

      {priorityInbox.map((n) => (
        <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
      ))}
    </Paper>
  );
};

export default PriorityInbox;
