import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/ru';

// Components
import Layout from './components/Layout/Layout';
import AuthGuard from './components/Auth/AuthGuard';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import Tasks from './pages/Tasks/Tasks';
import Employees from './pages/Employees/Employees';
import Financial from './pages/Financial/Financial';
import Materials from './pages/Materials/Materials';
import Estimates from './pages/Estimates/Estimates';
import Reports from './pages/Reports/Reports';
import Defects from './pages/Defects/Defects';
import Documents from './pages/Documents/Documents';
import { AuthProvider } from './contexts/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: '#333',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Box sx={{ display: 'flex' }}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <AuthGuard>
                      <Layout />
                    </AuthGuard>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects/*" element={<Projects />} />
                    <Route path="tasks/*" element={<Tasks />} />
                    <Route path="employees/*" element={<Employees />} />
                    <Route path="financial/*" element={<Financial />} />
                    <Route path="materials/*" element={<Materials />} />
                    <Route path="estimates/*" element={<Estimates />} />
                    <Route path="reports/*" element={<Reports />} />
                    <Route path="defects/*" element={<Defects />} />
                    <Route path="documents/*" element={<Documents />} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Box>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
