import { Router, Request, Response } from 'express';
import { userService } from '../services/userService';
import { validateRequest, createUserSchema, loginSchema } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { generateToken } from '../middleware/auth';
import { CreateUserRequest, LoginRequest, ApiResponse } from '../types';

const router = Router();

// User registration
router.post('/register', 
  validateRequest(createUserSchema),
  async (req: Request, res: Response) => {
    try {
      const userData: CreateUserRequest = req.body;
      
      const newUser = await userService.createUser(userData);
      
      // Generate JWT token
      const token = generateToken(newUser);
      
      const apiResponse: ApiResponse<{ user: any; token: string }> = {
        success: true,
        data: {
          user: newUser,
          token
        },
        message: 'User registered successfully'
      };

      res.status(201).json(apiResponse);
    } catch (error) {
      console.error('Registration error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Registration failed',
          code: 'REGISTRATION_ERROR',
          status: 400
        }
      };

      res.status(400).json(apiResponse);
    }
  }
);

// User login
router.post('/login', 
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const loginData: LoginRequest = req.body;
      
      const user = await userService.authenticateUser(loginData);
      
      // Generate JWT token
      const token = generateToken(user);
      
      const apiResponse: ApiResponse<{ user: any; token: string }> = {
        success: true,
        data: {
          user,
          token
        },
        message: 'Login successful'
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Login error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Login failed',
          code: 'LOGIN_ERROR',
          status: 401
        }
      };

      res.status(401).json(apiResponse);
    }
  }
);

// Get current user profile
router.get('/profile', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await userService.getUserById(userId);
      
      if (!user) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
            status: 404
          }
        };
        return res.status(404).json(apiResponse);
      }

      const apiResponse: ApiResponse<any> = {
        success: true,
        data: user
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get profile error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get profile',
          code: 'PROFILE_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Update user profile
router.put('/profile', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;
      
      const updatedUser = await userService.updateUser(userId, updateData);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Update profile error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update profile',
          code: 'PROFILE_UPDATE_ERROR',
          status: 400
        }
      };

      res.status(400).json(apiResponse);
    }
  }
);

// Change password
router.put('/change-password', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Current password and new password are required',
            code: 'MISSING_PASSWORD',
            status: 400
          }
        };
        return res.status(400).json(apiResponse);
      }
      
      await userService.changePassword(userId, currentPassword, newPassword);
      
      const apiResponse: ApiResponse<null> = {
        success: true,
        message: 'Password changed successfully'
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Change password error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to change password',
          code: 'PASSWORD_CHANGE_ERROR',
          status: 400
        }
      };

      res.status(400).json(apiResponse);
    }
  }
);

// Get user search history
router.get('/search-history', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const searchHistory = await userService.getUserSearchHistory(userId, limit);
      
      const apiResponse: ApiResponse<any[]> = {
        success: true,
        data: searchHistory
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get search history error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get search history',
          code: 'SEARCH_HISTORY_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Delete user account
router.delete('/account', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      await userService.deleteUser(userId);
      
      const apiResponse: ApiResponse<null> = {
        success: true,
        message: 'Account deleted successfully'
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Delete account error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete account',
          code: 'ACCOUNT_DELETE_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Verify token (for frontend to check if token is still valid)
router.get('/verify-token', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const apiResponse: ApiResponse<{ valid: boolean; user: any }> = {
        success: true,
        data: {
          valid: true,
          user: req.user
        }
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Token verification error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
          status: 401
        }
      };

      res.status(401).json(apiResponse);
    }
  }
);

export default router;