import React from 'react';
import {
  Card, CardContent, CardActions, Typography, Chip, IconButton,
  Tooltip, Box, alpha, useTheme,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Notification, NotificationType } from '../api/types';

const TYPE_COLOR: Record<NotificationType, 'primary' | 'success' | 'warning'> = {
  Placement: 'primary',
  Result: 'warning',
  Event: 'success',
};

interface Props {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

const NotificationCard: React.FC<Props> = ({ notification, onMarkRead }) => {
  const theme = useTheme();
  const { id, type, message, isRead, createdAt } = notification;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        borderLeft: `4px solid ${theme.palette[TYPE_COLOR[type]].main}`,
        backgroundColor: isRead ? 'background.paper' : alpha(theme.palette.primary.main, 0.04),
        opacity: isRead ? 0.8 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          <Chip
            label={type}
            color={TYPE_COLOR[type]}
            size="small"
          />
          {!isRead && (
            <Chip label="Unread" size="small" variant="outlined" color="primary" />
          )}
        </Box>
        <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.6 }}>
          {message}
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block" mt={1}>
          {new Date(createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </Typography>
      </CardContent>

      {onMarkRead && !isRead && (
        <CardActions sx={{ pt: 0.5, pb: 1, px: 2 }}>
          <Tooltip title="Mark as read">
            <IconButton
              id={`mark-read-${id}`}
              size="small"
              color="primary"
              onClick={() => onMarkRead(id)}
              aria-label={`Mark notification as read`}
            >
              <DoneAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
};

export default NotificationCard;
