"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../controllers/auth");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('full_name').optional().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('position').optional().isLength({ max: 100 }).withMessage('Position must be max 100 characters'),
    (0, express_validator_1.body)('company').optional().isLength({ max: 200 }).withMessage('Company must be max 200 characters')
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
const updateProfileValidation = [
    (0, express_validator_1.body)('full_name').optional().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('position').optional().isLength({ max: 100 }).withMessage('Position must be max 100 characters'),
    (0, express_validator_1.body)('company').optional().isLength({ max: 200 }).withMessage('Company must be max 200 characters'),
    (0, express_validator_1.body)('avatar_url').optional().isURL().withMessage('Valid URL is required for avatar')
];
const changePasswordValidation = [
    (0, express_validator_1.body)('current_password').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];
const confirmPasswordResetValidation = [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];
const refreshTokenValidation = [
    (0, express_validator_1.body)('refresh_token').notEmpty().withMessage('Refresh token is required')
];
router.post('/register', registerValidation, validation_1.validate, auth_2.register);
router.post('/login', loginValidation, validation_1.validate, auth_2.login);
router.post('/refresh-token', refreshTokenValidation, validation_1.validate, auth_2.refreshToken);
router.post('/reset-password', resetPasswordValidation, validation_1.validate, auth_2.resetPassword);
router.post('/confirm-password-reset', confirmPasswordResetValidation, validation_1.validate, auth_2.confirmPasswordReset);
router.use(auth_1.authenticate);
router.post('/logout', auth_2.logout);
router.get('/me', auth_2.getCurrentUser);
router.put('/profile', updateProfileValidation, validation_1.validate, auth_2.updateProfile);
router.post('/change-password', changePasswordValidation, validation_1.validate, auth_2.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map