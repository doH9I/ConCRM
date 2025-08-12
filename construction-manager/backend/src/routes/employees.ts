import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getTimeTracking,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  approveTimesheet,
  getEmployeeStats,
  getSalaryReport
} from '../controllers/employees';

const router = Router();

router.use(authenticate);

// Валидация для создания сотрудника
const createEmployeeValidation = [
  body('first_name').isLength({ min: 1, max: 100 }).withMessage('First name is required and must be max 100 characters'),
  body('last_name').isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be max 100 characters'),
  body('middle_name').optional().isLength({ max: 100 }).withMessage('Middle name must be max 100 characters'),
  body('position').isLength({ min: 1, max: 100 }).withMessage('Position is required and must be max 100 characters'),
  body('department').optional().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
  body('hire_date').optional().isISO8601().withMessage('Valid hire date is required'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('phone').optional().isLength({ max: 20 }).withMessage('Phone must be max 20 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('passport_series').optional().isLength({ max: 10 }).withMessage('Passport series must be max 10 characters'),
  body('passport_number').optional().isLength({ max: 20 }).withMessage('Passport number must be max 20 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must be max 500 characters')
];

// Валидация для обновления сотрудника
const updateEmployeeValidation = [
  param('id').isUUID().withMessage('Valid employee ID is required'),
  body('first_name').optional().isLength({ min: 1, max: 100 }).withMessage('First name must be max 100 characters'),
  body('last_name').optional().isLength({ min: 1, max: 100 }).withMessage('Last name must be max 100 characters'),
  body('middle_name').optional().isLength({ max: 100 }).withMessage('Middle name must be max 100 characters'),
  body('position').optional().isLength({ min: 1, max: 100 }).withMessage('Position must be max 100 characters'),
  body('department').optional().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
  body('hire_date').optional().isISO8601().withMessage('Valid hire date is required'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('phone').optional().isLength({ max: 20 }).withMessage('Phone must be max 20 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
];

// Валидация для записи времени
const timeEntryValidation = [
  body('employee_id').isUUID().withMessage('Valid employee ID is required'),
  body('project_id').isUUID().withMessage('Valid project ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('break_minutes').optional().isInt({ min: 0, max: 480 }).withMessage('Break minutes must be between 0 and 480'),
  body('total_hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Total hours must be between 0 and 24'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters')
];

// Валидация утверждения табеля
const approveTimesheetValidation = [
  body('employee_id').isUUID().withMessage('Valid employee ID is required'),
  body('date_from').isISO8601().withMessage('Valid start date is required'),
  body('date_to').isISO8601().withMessage('Valid end date is required')
];

// Валидация параметров запроса
const getEmployeesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('department').optional().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
  query('position').optional().isLength({ max: 100 }).withMessage('Position must be max 100 characters'),
  query('is_active').optional().isIn(['true', 'false', 'all']).withMessage('Is active must be true, false, or all'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search must be max 100 characters'),
  query('sort').optional().isIn(['first_name', 'last_name', 'position', 'department', 'hire_date', 'salary']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

// Валидация ID параметра
const employeeIdValidation = [
  param('id').isUUID().withMessage('Valid employee ID is required')
];

// Маршруты для сотрудников
router.get('/', getEmployeesValidation, validate, getEmployees);
router.post('/', authorize(['admin', 'manager']), createEmployeeValidation, validate, createEmployee);

router.get('/:id', employeeIdValidation, validate, getEmployee);
router.put('/:id', authorize(['admin', 'manager']), updateEmployeeValidation, validate, updateEmployee);
router.delete('/:id', authorize(['admin', 'manager']), employeeIdValidation, validate, deleteEmployee);

// Маршруты для табеля учета времени
router.get('/time-tracking/list', getTimeTracking);
router.post('/time-tracking', timeEntryValidation, validate, addTimeEntry);
router.put('/time-tracking/:id', timeEntryValidation, validate, updateTimeEntry);
router.delete('/time-tracking/:id', param('id').isUUID().withMessage('Valid time entry ID is required'), validate, deleteTimeEntry);
router.post('/time-tracking/approve', authorize(['admin', 'manager']), approveTimesheetValidation, validate, approveTimesheet);

// Маршруты для статистики и отчетов
router.get('/stats/employee', getEmployeeStats);
router.get('/reports/salary', authorize(['admin', 'manager']), getSalaryReport);

export default router;