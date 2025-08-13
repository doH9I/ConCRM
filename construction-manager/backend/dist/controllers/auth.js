"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPasswordReset = exports.resetPassword = exports.changePassword = exports.updateProfile = exports.getCurrentUser = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, full_name, phone, position, company } = req.body;
    if (!email || !password) {
        throw new errorHandler_1.AppError('Email and password are required', 400);
    }
    const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });
    if (authError) {
        (0, logger_1.logError)('User registration failed', authError, { email });
        throw new errorHandler_1.AppError(`Registration failed: ${authError.message}`, 400);
    }
    const { data: profile, error: profileError } = await supabase_1.supabase
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
        await supabase_1.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        (0, logger_1.logError)('Profile creation failed', profileError, { email, userId: authData.user.id });
        throw new errorHandler_1.AppError(`Profile creation failed: ${profileError.message}`, 400);
    }
    (0, logger_1.logInfo)('User registered successfully', { email, userId: authData.user.id });
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: profile,
            session: null
        }
    });
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errorHandler_1.AppError('Email and password are required', 400);
    }
    const { data: authData, error: authError } = await supabase_1.supabase.auth.signInWithPassword({
        email,
        password
    });
    if (authError) {
        (0, logger_1.logError)('Login failed', authError, { email });
        throw new errorHandler_1.AppError(`Login failed: ${authError.message}`, 401);
    }
    const { data: profile, error: profileError } = await supabase_1.supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
    if (profileError || !profile) {
        (0, logger_1.logError)('Profile not found after login', profileError, { email, userId: authData.user.id });
        throw new errorHandler_1.AppError('User profile not found', 404);
    }
    if (!profile.is_active) {
        throw new errorHandler_1.AppError('User account is deactivated', 401);
    }
    (0, logger_1.logInfo)('User logged in successfully', { email, userId: authData.user.id });
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: profile,
            session: authData.session
        }
    });
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error } = await supabase_1.supabase.auth.signOut();
    if (error) {
        (0, logger_1.logError)('Logout failed', error, { userId: req.user?.id });
        throw new errorHandler_1.AppError(`Logout failed: ${error.message}`, 400);
    }
    (0, logger_1.logInfo)('User logged out successfully', { userId: req.user?.id });
    res.json({
        success: true,
        message: 'Logout successful'
    });
});
exports.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        throw new errorHandler_1.AppError('Refresh token is required', 400);
    }
    const { data, error } = await supabase_1.supabase.auth.refreshSession({
        refresh_token
    });
    if (error) {
        (0, logger_1.logError)('Token refresh failed', error);
        throw new errorHandler_1.AppError(`Token refresh failed: ${error.message}`, 401);
    }
    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
            session: data.session
        }
    });
});
exports.getCurrentUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    res.json({
        success: true,
        data: req.user
    });
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { full_name, phone, position, company, avatar_url } = req.body;
    const { data: updatedProfile, error } = await supabase_1.supabase
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
        (0, logger_1.logError)('Profile update failed', error, { userId: req.user.id });
        throw new errorHandler_1.AppError(`Profile update failed: ${error.message}`, 400);
    }
    (0, logger_1.logInfo)('Profile updated successfully', { userId: req.user.id });
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
    });
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
        throw new errorHandler_1.AppError('Current password and new password are required', 400);
    }
    if (new_password.length < 6) {
        throw new errorHandler_1.AppError('New password must be at least 6 characters long', 400);
    }
    const { error: verifyError } = await supabase_1.supabase.auth.signInWithPassword({
        email: req.user.email,
        password: current_password
    });
    if (verifyError) {
        throw new errorHandler_1.AppError('Current password is incorrect', 400);
    }
    const { error } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(req.user.id, {
        password: new_password
    });
    if (error) {
        (0, logger_1.logError)('Password change failed', error, { userId: req.user.id });
        throw new errorHandler_1.AppError(`Password change failed: ${error.message}`, 400);
    }
    (0, logger_1.logInfo)('Password changed successfully', { userId: req.user.id });
    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});
exports.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new errorHandler_1.AppError('Email is required', 400);
    }
    const { error } = await supabase_1.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });
    if (error) {
        (0, logger_1.logError)('Password reset request failed', error, { email });
        throw new errorHandler_1.AppError(`Password reset failed: ${error.message}`, 400);
    }
    (0, logger_1.logInfo)('Password reset email sent', { email });
    res.json({
        success: true,
        message: 'Password reset email sent successfully'
    });
});
exports.confirmPasswordReset = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
        throw new errorHandler_1.AppError('Token and new password are required', 400);
    }
    if (new_password.length < 6) {
        throw new errorHandler_1.AppError('New password must be at least 6 characters long', 400);
    }
    const { error } = await supabase_1.supabase.auth.updateUser({
        password: new_password
    });
    if (error) {
        (0, logger_1.logError)('Password reset confirmation failed', error);
        throw new errorHandler_1.AppError(`Password reset failed: ${error.message}`, 400);
    }
    (0, logger_1.logInfo)('Password reset confirmed successfully');
    res.json({
        success: true,
        message: 'Password reset successfully'
    });
});
//# sourceMappingURL=auth.js.map