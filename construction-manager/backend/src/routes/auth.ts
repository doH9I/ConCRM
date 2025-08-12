import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  resetPassword,
  confirmPasswordReset
} from '../controllers/auth';

const router = Router();

// Валидация для регистрации
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('full_name').optional().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('position').optional().isLength({ max: 100 }).withMessage('Position must be max 100 characters'),
  body('company').optional().isLength({ max: 200 }).withMessage('Company must be max 200 characters')
];

// Валидация для входа
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Валидация для обновления профиля
const updateProfileValidation = [
  body('full_name').optional().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('position').optional().isLength({ max: 100 }).withMessage('Position must be max 100 characters'),
  body('company').optional().isLength({ max: 200 }).withMessage('Company must be max 200 characters'),
  body('avatar_url').optional().isURL().withMessage('Valid URL is required for avatar')
];

// Валидация для смены пароля
const changePasswordValidation = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

// Валидация для сброса пароля
const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Валидация для подтверждения сброса пароля
const confirmPasswordResetValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

// Валидация для обновления токена
const refreshTokenValidation = [
  body('refresh_token').notEmpty().withMessage('Refresh token is required')
];

// Публичные маршруты (без аутентификации)
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshTokenValidation, validate, refreshToken);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);
router.post('/confirm-password-reset', confirmPasswordResetValidation, validate, confirmPasswordReset);

// Защищенные маршруты (требуют аутентификации)
router.use(authenticate);

router.post('/logout', logout);
router.get('/me', getCurrentUser);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.post('/change-password', changePasswordValidation, validate, changePassword);

export default router;