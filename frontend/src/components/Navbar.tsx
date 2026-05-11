import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, Button, useMediaQuery, useTheme,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

interface Props {
  currentPage: 'dashboard' | 'notifications';
  onNavigate: (page: 'dashboard' | 'notifications') => void;
}

const Navbar: React.FC<Props> = ({ currentPage, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: '#1a56db' }}>
      <Toolbar>
        <NotificationsOutlinedIcon sx={{ mr: 1 }} />
        {!isMobile && (
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 4 }}>
            Campus Notify
          </Typography>
        )}
        <Box display="flex" gap={1}>
          <Button
            color="inherit"
            onClick={() => onNavigate('dashboard')}
            sx={{
              fontWeight: currentPage === 'dashboard' ? 700 : 400,
              borderBottom: currentPage === 'dashboard' ? '2px solid white' : 'none',
              borderRadius: 0,
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => onNavigate('notifications')}
            sx={{
              fontWeight: currentPage === 'notifications' ? 700 : 400,
              borderBottom: currentPage === 'notifications' ? '2px solid white' : 'none',
              borderRadius: 0,
            }}
          >
            Notifications
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
