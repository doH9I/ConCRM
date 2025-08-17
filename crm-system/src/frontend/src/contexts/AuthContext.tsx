import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import { authApi } from '../services/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authApi.getProfile();
          dispatch(loginSuccess({ user: userData, token }));
        } catch (error) {
          localStorage.removeItem('token');
          dispatch(logout());
        }
      }
      setInitialized(true);
    };

    initializeAuth();
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const response = await authApi.login(email, password);
      dispatch(loginSuccess(response));
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Login failed'));
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch(loginStart());
      await authApi.register(userData);
      // After successful registration, log in the user
      await login(userData.email, userData.password);
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Registration failed'));
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearError = () => {
    dispatch(loginFailure(''));
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};