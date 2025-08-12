import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, requireProjectAccess } from '../middleware/auth';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStatistics,
  getProjectParticipants,
  updateProjectProgress
} from '../controllers/projects';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Валидация для создания проекта
const createProjectValidation = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Project name is required and must be max 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must be max 500 characters'),
  body('client_company_id').optional().isUUID().withMessage('Valid client company ID is required'),
  body('contractor_company_id').optional().isUUID().withMessage('Valid contractor company ID is required'),
  body('status').optional().isIn(['planning', 'active', 'completed', 'cancelled', 'paused']).withMessage('Invalid status'),
  body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
  body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
  body('planned_end_date').optional().isISO8601().withMessage('Valid planned end date is required'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number')
];

// Валидация для обновления проекта
const updateProjectValidation = [
  param('id').isUUID().withMessage('Valid project ID is required'),
  body('name').optional().isLength({ min: 1, max: 200 }).withMessage('Project name must be max 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must be max 500 characters'),
  body('client_company_id').optional().isUUID().withMessage('Valid client company ID is required'),
  body('contractor_company_id').optional().isUUID().withMessage('Valid contractor company ID is required'),
  body('status').optional().isIn(['planning', 'active', 'completed', 'cancelled', 'paused']).withMessage('Invalid status'),
  body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
  body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
  body('planned_end_date').optional().isISO8601().withMessage('Valid planned end date is required'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('actual_cost').optional().isNumeric().withMessage('Actual cost must be a number'),
  body('progress_percent').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
];

// Валидация для обновления прогресса
const updateProgressValidation = [
  param('id').isUUID().withMessage('Valid project ID is required'),
  body('progress_percent').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
];

// Валидация параметров запроса
const getProjectsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['planning', 'active', 'completed', 'cancelled', 'paused']).withMessage('Invalid status'),
  query('manager_id').optional().isUUID().withMessage('Valid manager ID is required'),
  query('client_company_id').optional().isUUID().withMessage('Valid client company ID is required'),
  query('sort').optional().isIn(['name', 'created_at', 'updated_at', 'start_date', 'end_date', 'budget', 'progress_percent']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

// Валидация ID параметра
const projectIdValidation = [
  param('id').isUUID().withMessage('Valid project ID is required')
];

// Маршруты
router.get('/', getProjectsValidation, validate, getProjects);
router.post('/', createProjectValidation, validate, createProject);

router.get('/:id', projectIdValidation, validate, requireProjectAccess, getProject);
router.put('/:id', updateProjectValidation, validate, requireProjectAccess, updateProject);
router.delete('/:id', projectIdValidation, validate, requireProjectAccess, deleteProject);

router.get('/:id/statistics', projectIdValidation, validate, requireProjectAccess, getProjectStatistics);
router.get('/:id/participants', projectIdValidation, validate, requireProjectAccess, getProjectParticipants);
router.patch('/:id/progress', updateProgressValidation, validate, requireProjectAccess, updateProjectProgress);

export default router;