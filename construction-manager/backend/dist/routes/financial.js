"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const financial_1 = require("../controllers/financial");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const createFinancialOperationValidation = [
    (0, express_validator_1.body)('project_id').isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('operation_type').isIn(['income', 'expense']).withMessage('Operation type must be income or expense'),
    (0, express_validator_1.body)('category').isLength({ min: 1, max: 100 }).withMessage('Category is required and must be max 100 characters'),
    (0, express_validator_1.body)('subcategory').optional().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('currency').optional().isLength({ max: 10 }).withMessage('Currency must be max 10 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    (0, express_validator_1.body)('document_number').optional().isLength({ max: 100 }).withMessage('Document number must be max 100 characters'),
    (0, express_validator_1.body)('document_date').optional().isISO8601().withMessage('Valid document date is required'),
    (0, express_validator_1.body)('counterparty').optional().isLength({ max: 200 }).withMessage('Counterparty must be max 200 characters'),
    (0, express_validator_1.body)('payment_method').optional().isLength({ max: 100 }).withMessage('Payment method must be max 100 characters'),
    (0, express_validator_1.body)('account').optional().isLength({ max: 100 }).withMessage('Account must be max 100 characters')
];
const updateFinancialOperationValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid operation ID is required'),
    (0, express_validator_1.body)('operation_type').optional().isIn(['income', 'expense']).withMessage('Operation type must be income or expense'),
    (0, express_validator_1.body)('category').optional().isLength({ min: 1, max: 100 }).withMessage('Category must be max 100 characters'),
    (0, express_validator_1.body)('subcategory').optional().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
    (0, express_validator_1.body)('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('currency').optional().isLength({ max: 10 }).withMessage('Currency must be max 10 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    (0, express_validator_1.body)('document_number').optional().isLength({ max: 100 }).withMessage('Document number must be max 100 characters'),
    (0, express_validator_1.body)('document_date').optional().isISO8601().withMessage('Valid document date is required'),
    (0, express_validator_1.body)('counterparty').optional().isLength({ max: 200 }).withMessage('Counterparty must be max 200 characters'),
    (0, express_validator_1.body)('payment_method').optional().isLength({ max: 100 }).withMessage('Payment method must be max 100 characters'),
    (0, express_validator_1.body)('account').optional().isLength({ max: 100 }).withMessage('Account must be max 100 characters')
];
const getFinancialOperationsValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('project_id').optional().isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.query)('operation_type').optional().isIn(['income', 'expense']).withMessage('Operation type must be income or expense'),
    (0, express_validator_1.query)('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
    (0, express_validator_1.query)('subcategory').optional().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
    (0, express_validator_1.query)('date_from').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('date_to').optional().isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.query)('amount_from').optional().isFloat({ min: 0 }).withMessage('Amount from must be a positive number'),
    (0, express_validator_1.query)('amount_to').optional().isFloat({ min: 0 }).withMessage('Amount to must be a positive number'),
    (0, express_validator_1.query)('sort').optional().isIn(['amount', 'document_date', 'created_at', 'category', 'operation_type']).withMessage('Invalid sort field'),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];
const cashFlowReportValidation = [
    (0, express_validator_1.query)('date_from').isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('date_to').isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.query)('project_id').optional().isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.query)('group_by').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
];
const operationIdValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid operation ID is required')
];
const projectIdValidation = [
    (0, express_validator_1.param)('project_id').isUUID().withMessage('Valid project ID is required')
];
router.get('/', getFinancialOperationsValidation, validation_1.validate, financial_1.getFinancialOperations);
router.post('/', createFinancialOperationValidation, validation_1.validate, financial_1.createFinancialOperation);
router.get('/:id', operationIdValidation, validation_1.validate, financial_1.getFinancialOperation);
router.put('/:id', updateFinancialOperationValidation, validation_1.validate, financial_1.updateFinancialOperation);
router.delete('/:id', (0, auth_1.authorize)(['admin', 'manager']), operationIdValidation, validation_1.validate, financial_1.deleteFinancialOperation);
router.patch('/:id/approve', (0, auth_1.authorize)(['admin', 'manager']), operationIdValidation, validation_1.validate, financial_1.approveFinancialOperation);
router.get('/stats/summary', financial_1.getFinancialStats);
router.get('/reports/cash-flow', cashFlowReportValidation, validation_1.validate, financial_1.getCashFlowReport);
router.get('/projects/:project_id/budget', projectIdValidation, validation_1.validate, financial_1.getProjectBudget);
router.get('/categories/expenses', financial_1.getExpenseCategories);
router.get('/export/data', financial_1.exportFinancialData);
exports.default = router;
//# sourceMappingURL=financial.js.map