"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const employees_1 = require("../controllers/employees");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const createEmployeeValidation = [
    (0, express_validator_1.body)('first_name').isLength({ min: 1, max: 100 }).withMessage('First name is required and must be max 100 characters'),
    (0, express_validator_1.body)('last_name').isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be max 100 characters'),
    (0, express_validator_1.body)('middle_name').optional().isLength({ max: 100 }).withMessage('Middle name must be max 100 characters'),
    (0, express_validator_1.body)('position').isLength({ min: 1, max: 100 }).withMessage('Position is required and must be max 100 characters'),
    (0, express_validator_1.body)('department').optional().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
    (0, express_validator_1.body)('hire_date').optional().isISO8601().withMessage('Valid hire date is required'),
    (0, express_validator_1.body)('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
    (0, express_validator_1.body)('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
    (0, express_validator_1.body)('phone').optional().isLength({ max: 20 }).withMessage('Phone must be max 20 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('passport_series').optional().isLength({ max: 10 }).withMessage('Passport series must be max 10 characters'),
    (0, express_validator_1.body)('passport_number').optional().isLength({ max: 20 }).withMessage('Passport number must be max 20 characters'),
    (0, express_validator_1.body)('address').optional().isLength({ max: 500 }).withMessage('Address must be max 500 characters')
];
const updateEmployeeValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid employee ID is required'),
    (0, express_validator_1.body)('first_name').optional().isLength({ min: 1, max: 100 }).withMessage('First name must be max 100 characters'),
    (0, express_validator_1.body)('last_name').optional().isLength({ min: 1, max: 100 }).withMessage('Last name must be max 100 characters'),
    (0, express_validator_1.body)('middle_name').optional().isLength({ max: 100 }).withMessage('Middle name must be max 100 characters'),
    (0, express_validator_1.body)('position').optional().isLength({ min: 1, max: 100 }).withMessage('Position must be max 100 characters'),
    (0, express_validator_1.body)('department').optional().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
    (0, express_validator_1.body)('hire_date').optional().isISO8601().withMessage('Valid hire date is required'),
    (0, express_validator_1.body)('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
    (0, express_validator_1.body)('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
    (0, express_validator_1.body)('phone').optional().isLength({ max: 20 }).withMessage('Phone must be max 20 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
];
const timeEntryValidation = [
    (0, express_validator_1.body)('employee_id').isUUID().withMessage('Valid employee ID is required'),
    (0, express_validator_1.body)('project_id').isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
    (0, express_validator_1.body)('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
    (0, express_validator_1.body)('break_minutes').optional().isInt({ min: 0, max: 480 }).withMessage('Break minutes must be between 0 and 480'),
    (0, express_validator_1.body)('total_hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Total hours must be between 0 and 24'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters')
];
const approveTimesheetValidation = [
    (0, express_validator_1.body)('employee_id').isUUID().withMessage('Valid employee ID is required'),
    (0, express_validator_1.body)('date_from').isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('date_to').isISO8601().withMessage('Valid end date is required')
];
const getEmployeesValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('department').optional().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
    (0, express_validator_1.query)('position').optional().isLength({ max: 100 }).withMessage('Position must be max 100 characters'),
    (0, express_validator_1.query)('is_active').optional().isIn(['true', 'false', 'all']).withMessage('Is active must be true, false, or all'),
    (0, express_validator_1.query)('search').optional().isLength({ max: 100 }).withMessage('Search must be max 100 characters'),
    (0, express_validator_1.query)('sort').optional().isIn(['first_name', 'last_name', 'position', 'department', 'hire_date', 'salary']).withMessage('Invalid sort field'),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];
const employeeIdValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid employee ID is required')
];
router.get('/', getEmployeesValidation, validation_1.validate, employees_1.getEmployees);
router.post('/', (0, auth_1.authorize)(['admin', 'manager']), createEmployeeValidation, validation_1.validate, employees_1.createEmployee);
router.get('/:id', employeeIdValidation, validation_1.validate, employees_1.getEmployee);
router.put('/:id', (0, auth_1.authorize)(['admin', 'manager']), updateEmployeeValidation, validation_1.validate, employees_1.updateEmployee);
router.delete('/:id', (0, auth_1.authorize)(['admin', 'manager']), employeeIdValidation, validation_1.validate, employees_1.deleteEmployee);
router.get('/time-tracking/list', employees_1.getTimeTracking);
router.post('/time-tracking', timeEntryValidation, validation_1.validate, employees_1.addTimeEntry);
router.put('/time-tracking/:id', timeEntryValidation, validation_1.validate, employees_1.updateTimeEntry);
router.delete('/time-tracking/:id', (0, express_validator_1.param)('id').isUUID().withMessage('Valid time entry ID is required'), validation_1.validate, employees_1.deleteTimeEntry);
router.post('/time-tracking/approve', (0, auth_1.authorize)(['admin', 'manager']), approveTimesheetValidation, validation_1.validate, employees_1.approveTimesheet);
router.get('/stats/employee', employees_1.getEmployeeStats);
router.get('/reports/salary', (0, auth_1.authorize)(['admin', 'manager']), employees_1.getSalaryReport);
exports.default = router;
//# sourceMappingURL=employees.js.map