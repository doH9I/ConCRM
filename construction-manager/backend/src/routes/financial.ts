import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import {
  getFinancialOperations,
  getFinancialOperation,
  createFinancialOperation,
  updateFinancialOperation,
  deleteFinancialOperation,
  approveFinancialOperation,
  getFinancialStats,
  getCashFlowReport,
  getProjectBudget,
  getExpenseCategories,
  exportFinancialData
} from '../controllers/financial';

const router = Router();

router.use(authenticate);

// Валидация для создания финансовой операции
const createFinancialOperationValidation = [
  body('project_id').isUUID().withMessage('Valid project ID is required'),
  body('operation_type').isIn(['income', 'expense']).withMessage('Operation type must be income or expense'),
  body('category').isLength({ min: 1, max: 100 }).withMessage('Category is required and must be max 100 characters'),
  body('subcategory').optional().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isLength({ max: 10 }).withMessage('Currency must be max 10 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('document_number').optional().isLength({ max: 100 }).withMessage('Document number must be max 100 characters'),
  body('document_date').optional().isISO8601().withMessage('Valid document date is required'),
  body('counterparty').optional().isLength({ max: 200 }).withMessage('Counterparty must be max 200 characters'),
  body('payment_method').optional().isLength({ max: 100 }).withMessage('Payment method must be max 100 characters'),
  body('account').optional().isLength({ max: 100 }).withMessage('Account must be max 100 characters')
];

// Валидация для обновления финансовой операции
const updateFinancialOperationValidation = [
  param('id').isUUID().withMessage('Valid operation ID is required'),
  body('operation_type').optional().isIn(['income', 'expense']).withMessage('Operation type must be income or expense'),
  body('category').optional().isLength({ min: 1, max: 100 }).withMessage('Category must be max 100 characters'),
  body('subcategory').optional().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isLength({ max: 10 }).withMessage('Currency must be max 10 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('document_number').optional().isLength({ max: 100 }).withMessage('Document number must be max 100 characters'),
  body('document_date').optional().isISO8601().withMessage('Valid document date is required'),
  body('counterparty').optional().isLength({ max: 200 }).withMessage('Counterparty must be max 200 characters'),
  body('payment_method').optional().isLength({ max: 100 }).withMessage('Payment method must be max 100 characters'),
  body('account').optional().isLength({ max: 100 }).withMessage('Account must be max 100 characters')
];

// Валидация параметров запроса
const getFinancialOperationsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('project_id').optional().isUUID().withMessage('Valid project ID is required'),
  query('operation_type').optional().isIn(['income', 'expense']).withMessage('Operation type must be income or expense'),
  query('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
  query('subcategory').optional().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
  query('date_from').optional().isISO8601().withMessage('Valid start date is required'),
  query('date_to').optional().isISO8601().withMessage('Valid end date is required'),
  query('amount_from').optional().isFloat({ min: 0 }).withMessage('Amount from must be a positive number'),
  query('amount_to').optional().isFloat({ min: 0 }).withMessage('Amount to must be a positive number'),
  query('sort').optional().isIn(['amount', 'document_date', 'created_at', 'category', 'operation_type']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

// Валидация для отчета о движении денежных средств
const cashFlowReportValidation = [
  query('date_from').isISO8601().withMessage('Valid start date is required'),
  query('date_to').isISO8601().withMessage('Valid end date is required'),
  query('project_id').optional().isUUID().withMessage('Valid project ID is required'),
  query('group_by').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
];

// Валидация ID параметра
const operationIdValidation = [
  param('id').isUUID().withMessage('Valid operation ID is required')
];

// Валидация ID проекта
const projectIdValidation = [
  param('project_id').isUUID().withMessage('Valid project ID is required')
];

// Основные маршруты для финансовых операций
router.get('/', getFinancialOperationsValidation, validate, getFinancialOperations);
router.post('/', createFinancialOperationValidation, validate, createFinancialOperation);

router.get('/:id', operationIdValidation, validate, getFinancialOperation);
router.put('/:id', updateFinancialOperationValidation, validate, updateFinancialOperation);
router.delete('/:id', authorize(['admin', 'manager']), operationIdValidation, validate, deleteFinancialOperation);
router.patch('/:id/approve', authorize(['admin', 'manager']), operationIdValidation, validate, approveFinancialOperation);

// Маршруты для статистики и отчетов
router.get('/stats/summary', getFinancialStats);
router.get('/reports/cash-flow', cashFlowReportValidation, validate, getCashFlowReport);
router.get('/projects/:project_id/budget', projectIdValidation, validate, getProjectBudget);

// Маршруты для справочников
router.get('/categories/expenses', getExpenseCategories);

// Маршруты для экспорта
router.get('/export/data', exportFinancialData);

export default router;