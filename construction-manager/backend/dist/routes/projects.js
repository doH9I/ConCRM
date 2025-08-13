"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const projects_1 = require("../controllers/projects");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const createProjectValidation = [
    (0, express_validator_1.body)('name').isLength({ min: 1, max: 200 }).withMessage('Project name is required and must be max 200 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    (0, express_validator_1.body)('address').optional().isLength({ max: 500 }).withMessage('Address must be max 500 characters'),
    (0, express_validator_1.body)('client_company_id').optional().isUUID().withMessage('Valid client company ID is required'),
    (0, express_validator_1.body)('contractor_company_id').optional().isUUID().withMessage('Valid contractor company ID is required'),
    (0, express_validator_1.body)('status').optional().isIn(['planning', 'active', 'completed', 'cancelled', 'paused']).withMessage('Invalid status'),
    (0, express_validator_1.body)('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('end_date').optional().isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.body)('planned_end_date').optional().isISO8601().withMessage('Valid planned end date is required'),
    (0, express_validator_1.body)('budget').optional().isNumeric().withMessage('Budget must be a number')
];
const updateProjectValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('name').optional().isLength({ min: 1, max: 200 }).withMessage('Project name must be max 200 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    (0, express_validator_1.body)('address').optional().isLength({ max: 500 }).withMessage('Address must be max 500 characters'),
    (0, express_validator_1.body)('client_company_id').optional().isUUID().withMessage('Valid client company ID is required'),
    (0, express_validator_1.body)('contractor_company_id').optional().isUUID().withMessage('Valid contractor company ID is required'),
    (0, express_validator_1.body)('status').optional().isIn(['planning', 'active', 'completed', 'cancelled', 'paused']).withMessage('Invalid status'),
    (0, express_validator_1.body)('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('end_date').optional().isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.body)('planned_end_date').optional().isISO8601().withMessage('Valid planned end date is required'),
    (0, express_validator_1.body)('budget').optional().isNumeric().withMessage('Budget must be a number'),
    (0, express_validator_1.body)('actual_cost').optional().isNumeric().withMessage('Actual cost must be a number'),
    (0, express_validator_1.body)('progress_percent').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
];
const updateProgressValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('progress_percent').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
];
const getProjectsValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('status').optional().isIn(['planning', 'active', 'completed', 'cancelled', 'paused']).withMessage('Invalid status'),
    (0, express_validator_1.query)('manager_id').optional().isUUID().withMessage('Valid manager ID is required'),
    (0, express_validator_1.query)('client_company_id').optional().isUUID().withMessage('Valid client company ID is required'),
    (0, express_validator_1.query)('sort').optional().isIn(['name', 'created_at', 'updated_at', 'start_date', 'end_date', 'budget', 'progress_percent']).withMessage('Invalid sort field'),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];
const projectIdValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid project ID is required')
];
router.get('/', getProjectsValidation, validation_1.validate, projects_1.getProjects);
router.post('/', createProjectValidation, validation_1.validate, projects_1.createProject);
router.get('/:id', projectIdValidation, validation_1.validate, auth_1.requireProjectAccess, projects_1.getProject);
router.put('/:id', updateProjectValidation, validation_1.validate, auth_1.requireProjectAccess, projects_1.updateProject);
router.delete('/:id', projectIdValidation, validation_1.validate, auth_1.requireProjectAccess, projects_1.deleteProject);
router.get('/:id/statistics', projectIdValidation, validation_1.validate, auth_1.requireProjectAccess, projects_1.getProjectStatistics);
router.get('/:id/participants', projectIdValidation, validation_1.validate, auth_1.requireProjectAccess, projects_1.getProjectParticipants);
router.patch('/:id/progress', updateProgressValidation, validation_1.validate, auth_1.requireProjectAccess, projects_1.updateProjectProgress);
exports.default = router;
//# sourceMappingURL=projects.js.map