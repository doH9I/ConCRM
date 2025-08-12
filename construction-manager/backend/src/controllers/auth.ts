import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest, User, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo, logError } from '../middleware/logger';

// Регистрация пользователя
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, full_name, phone, position, company } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Создаем пользователя в Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    logError('User registration failed', authError, { email });
    throw new AppError(`Registration failed: ${authError.message}`, 400);
  }

  // Создаем профиль пользователя
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name,
      phone,
      position,
      company,
      role: 'user'
    })
    .select()
    .single();

  if (profileError) {
    // Если профиль не создался, удаляем пользователя из auth
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    logError('Profile creation failed', profileError, { email, userId: authData.user.id });
    throw new AppError(`Profile creation failed: ${profileError.message}`, 400);
  }

  logInfo('User registered successfully', { email, userId: authData.user.id });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: profile,
      session: null // Пользователь должен войти отдельно
    }
  } as ApiResponse<{ user: User; session: any }>);
});

// Вход в систему
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Аутентификация через Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    logError('Login failed', authError, { email });
    throw new AppError(`Login failed: ${authError.message}`, 401);
  }

  // Получаем профиль пользователя
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    logError('Profile not found after login', profileError, { email, userId: authData.user.id });
    throw new AppError('User profile not found', 404);
  }

  // Проверяем, активен ли пользователь
  if (!profile.is_active) {
    throw new AppError('User account is deactivated', 401);
  }

  logInfo('User logged in successfully', { email, userId: authData.user.id });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: profile,
      session: authData.session
    }
  } as ApiResponse<{ user: User; session: any }>);
});

// Выход из системы
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    logError('Logout failed', error, { userId: req.user?.id });
    throw new AppError(`Logout failed: ${error.message}`, 400);
  }

  logInfo('User logged out successfully', { userId: req.user?.id });

  res.json({
    success: true,
    message: 'Logout successful'
  } as ApiResponse);
});

// Обновление токена
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError('Refresh token is required', 400);
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token
  });

  if (error) {
    logError('Token refresh failed', error);
    throw new AppError(`Token refresh failed: ${error.message}`, 401);
  }

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      session: data.session
    }
  } as ApiResponse<{ session: any }>);
});

// Получение текущего пользователя
export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: req.user
  } as ApiResponse<User>);
});

// Обновление профиля пользователя
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { full_name, phone, position, company, avatar_url } = req.body;

  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone,
      position,
      company,
      avatar_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    logError('Profile update failed', error, { userId: req.user.id });
    throw new AppError(`Profile update failed: ${error.message}`, 400);
  }

  logInfo('Profile updated successfully', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile
  } as ApiResponse<User>);
});

// Изменение пароля
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (new_password.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  // Сначала проверяем текущий пароль, пытаясь войти с ним
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: req.user.email,
    password: current_password
  });

  if (verifyError) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Обновляем пароль
  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
    password: new_password
  });

  if (error) {
    logError('Password change failed', error, { userId: req.user.id });
    throw new AppError(`Password change failed: ${error.message}`, 400);
  }

  logInfo('Password changed successfully', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Password changed successfully'
  } as ApiResponse);
});

// Сброс пароля (отправка email)
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`
  });

  if (error) {
    logError('Password reset request failed', error, { email });
    throw new AppError(`Password reset failed: ${error.message}`, 400);
  }

  logInfo('Password reset email sent', { email });

  res.json({
    success: true,
    message: 'Password reset email sent successfully'
  } as ApiResponse);
});

// Подтверждение сброса пароля
export const confirmPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    throw new AppError('Token and new password are required', 400);
  }

  if (new_password.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  const { error } = await supabase.auth.updateUser({
    password: new_password
  });

  if (error) {
    logError('Password reset confirmation failed', error);
    throw new AppError(`Password reset failed: ${error.message}`, 400);
  }

  logInfo('Password reset confirmed successfully');

  res.json({
    success: true,
    message: 'Password reset successfully'
  } as ApiResponse);
});