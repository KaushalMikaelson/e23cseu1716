import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './styles/theme';
import { NotificationProvider } from './state/NotificationContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';

type Page = 'dashboard' | 'notifications';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Box minHeight="100vh" bgcolor="background.default">
          <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
          {currentPage === 'dashboard' ? <Dashboard /> : <Notifications />}
        </Box>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
