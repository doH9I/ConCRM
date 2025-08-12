import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, requireProjectAccess } from '../middleware/auth';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getOverdueTasks,
  updateTaskStatus,
  addTimeToTask,
  getTasksStatistics
} from '../controllers/tasks';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Валидация для создания задачи
const createTaskValidation = [
  body('project_id').isUUID().withMessage('Valid project ID is required'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('Task title is required and must be max 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
  body('stage_id').optional().isUUID().withMessage('Valid stage ID is required'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assigned_to').optional().isUUID().withMessage('Valid user ID is required'),
  body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
  body('due_date').optional().isISO8601().withMessage('Valid due date is required'),
  body('estimated_hours').optional().isInt({ min: 1 }).withMessage('Estimated hours must be a positive integer')
];

// Валидация для обновления задачи
const updateTaskValidation = [
  param('id').isUUID().withMessage('Valid task ID is required'),
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Task title must be max 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
  body('stage_id').optional().isUUID().withMessage('Valid stage ID is required'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assigned_to').optional().isUUID().withMessage('Valid user ID is required'),
  body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
  body('due_date').optional().isISO8601().withMessage('Valid due date is required'),
  body('estimated_hours').optional().isInt({ min: 1 }).withMessage('Estimated hours must be a positive integer'),
  body('actual_hours').optional().isInt({ min: 0 }).withMessage('Actual hours must be a non-negative integer')
];

// Валидация для обновления статуса
const updateStatusValidation = [
  param('id').isUUID().withMessage('Valid task ID is required'),
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required')
];

// Валидация для добавления времени
const addTimeValidation = [
  param('id').isUUID().withMessage('Valid task ID is required'),
  body('hours').isFloat({ min: 0.1 }).withMessage('Hours must be a positive number')
];

// Валидация параметров запроса
const getTasksValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('project_id').optional().isUUID().withMessage('Valid project ID is required'),
  query('stage_id').optional().isUUID().withMessage('Valid stage ID is required'),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('assigned_to').optional().isUUID().withMessage('Valid user ID is required'),
  query('due_date_from').optional().isISO8601().withMessage('Valid date is required'),
  query('due_date_to').optional().isISO8601().withMessage('Valid date is required'),
  query('sort').optional().isIn(['title', 'created_at', 'updated_at', 'due_date', 'priority', 'status']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

// Валидация ID параметра
const taskIdValidation = [
  param('id').isUUID().withMessage('Valid task ID is required')
];

// Маршруты
router.get('/', getTasksValidation, validate, getTasks);
router.get('/my', getTasksValidation, validate, getMyTasks);
router.get('/overdue', getTasksValidation, validate, getOverdueTasks);
router.get('/statistics', getTasksStatistics);
router.post('/', createTaskValidation, validate, createTask);

router.get('/:id', taskIdValidation, validate, getTask);
router.put('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', taskIdValidation, validate, deleteTask);
router.patch('/:id/status', updateStatusValidation, validate, updateTaskStatus);
router.patch('/:id/time', addTimeValidation, validate, addTimeToTask);

export default router;