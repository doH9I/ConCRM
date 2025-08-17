import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';

import { store } from './store';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Companies from './pages/Companies/Companies';
import Projects from './pages/Projects/Projects';
import Leads from './pages/Leads/Leads';
import Tasks from './pages/Tasks/Tasks';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;