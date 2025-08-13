"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const tasks_1 = require("../controllers/tasks");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const createTaskValidation = [
    (0, express_validator_1.body)('project_id').isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('title').isLength({ min: 1, max: 200 }).withMessage('Task title is required and must be max 200 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    (0, express_validator_1.body)('stage_id').optional().isUUID().withMessage('Valid stage ID is required'),
    (0, express_validator_1.body)('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('assigned_to').optional().isUUID().withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('due_date').optional().isISO8601().withMessage('Valid due date is required'),
    (0, express_validator_1.body)('estimated_hours').optional().isInt({ min: 1 }).withMessage('Estimated hours must be a positive integer')
];
const updateTaskValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid task ID is required'),
    (0, express_validator_1.body)('title').optional().isLength({ min: 1, max: 200 }).withMessage('Task title must be max 200 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    (0, express_validator_1.body)('stage_id').optional().isUUID().withMessage('Valid stage ID is required'),
    (0, express_validator_1.body)('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('assigned_to').optional().isUUID().withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('due_date').optional().isISO8601().withMessage('Valid due date is required'),
    (0, express_validator_1.body)('estimated_hours').optional().isInt({ min: 1 }).withMessage('Estimated hours must be a positive integer'),
    (0, express_validator_1.body)('actual_hours').optional().isInt({ min: 0 }).withMessage('Actual hours must be a non-negative integer')
];
const updateStatusValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid task ID is required'),
    (0, express_validator_1.body)('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required')
];
const addTimeValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid task ID is required'),
    (0, express_validator_1.body)('hours').isFloat({ min: 0.1 }).withMessage('Hours must be a positive number')
];
const getTasksValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('project_id').optional().isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.query)('stage_id').optional().isUUID().withMessage('Valid stage ID is required'),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    (0, express_validator_1.query)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.query)('assigned_to').optional().isUUID().withMessage('Valid user ID is required'),
    (0, express_validator_1.query)('due_date_from').optional().isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.query)('due_date_to').optional().isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.query)('sort').optional().isIn(['title', 'created_at', 'updated_at', 'due_date', 'priority', 'status']).withMessage('Invalid sort field'),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];
const taskIdValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid task ID is required')
];
router.get('/', getTasksValidation, validation_1.validate, tasks_1.getTasks);
router.get('/my', getTasksValidation, validation_1.validate, tasks_1.getMyTasks);
router.get('/overdue', getTasksValidation, validation_1.validate, tasks_1.getOverdueTasks);
router.get('/statistics', tasks_1.getTasksStatistics);
router.post('/', createTaskValidation, validation_1.validate, tasks_1.createTask);
router.get('/:id', taskIdValidation, validation_1.validate, tasks_1.getTask);
router.put('/:id', updateTaskValidation, validation_1.validate, tasks_1.updateTask);
router.delete('/:id', taskIdValidation, validation_1.validate, tasks_1.deleteTask);
router.patch('/:id/status', updateStatusValidation, validation_1.validate, tasks_1.updateTaskStatus);
router.patch('/:id/time', addTimeValidation, validation_1.validate, tasks_1.addTimeToTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map