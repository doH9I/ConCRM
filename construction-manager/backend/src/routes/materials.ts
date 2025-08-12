import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getWarehouseOperations,
  createWarehouseOperation,
  updateWarehouseOperation,
  deleteWarehouseOperation,
  getMaterialStock,
  getWarehouseStats,
  getMaterialMovementReport,
  reserveMaterial,
  unreserveMaterial
} from '../controllers/materials';

const router = Router();

router.use(authenticate);

// Валидация для создания материала
const createMaterialValidation = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Material name is required and must be max 200 characters'),
  body('code').optional().isLength({ max: 50 }).withMessage('Material code must be max 50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('unit').isLength({ min: 1, max: 20 }).withMessage('Unit is required and must be max 20 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
  body('min_stock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer')
];

// Валидация для обновления материала
const updateMaterialValidation = [
  param('id').isUUID().withMessage('Valid material ID is required'),
  body('name').optional().isLength({ min: 1, max: 200 }).withMessage('Material name must be max 200 characters'),
  body('code').optional().isLength({ max: 50 }).withMessage('Material code must be max 50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('unit').optional().isLength({ min: 1, max: 20 }).withMessage('Unit must be max 20 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
  body('min_stock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer')
];

// Валидация для складской операции
const warehouseOperationValidation = [
  body('material_id').isUUID().withMessage('Valid material ID is required'),
  body('project_id').isUUID().withMessage('Valid project ID is required'),
  body('operation_type').isIn(['receipt', 'consumption', 'transfer', 'write_off']).withMessage('Invalid operation type'),
  body('quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be a positive number'),
  body('unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('total_price').optional().isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  body('document_number').optional().isLength({ max: 100 }).withMessage('Document number must be max 100 characters'),
  body('document_date').optional().isISO8601().withMessage('Valid document date is required'),
  body('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be max 500 characters')
];

// Валидация для резервирования материалов
const reserveMaterialValidation = [
  body('material_id').isUUID().withMessage('Valid material ID is required'),
  body('project_id').isUUID().withMessage('Valid project ID is required'),
  body('quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be a positive number')
];

// Валидация параметров запроса для материалов
const getMaterialsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
  query('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search must be max 100 characters'),
  query('min_stock_alert').optional().isIn(['true', 'false']).withMessage('Min stock alert must be true or false'),
  query('sort').optional().isIn(['name', 'code', 'category', 'price', 'min_stock', 'created_at']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

// Валидация параметров запроса для складских операций
const getWarehouseOperationsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('material_id').optional().isUUID().withMessage('Valid material ID is required'),
  query('project_id').optional().isUUID().withMessage('Valid project ID is required'),
  query('operation_type').optional().isIn(['receipt', 'consumption', 'transfer', 'write_off']).withMessage('Invalid operation type'),
  query('date_from').optional().isISO8601().withMessage('Valid start date is required'),
  query('date_to').optional().isISO8601().withMessage('Valid end date is required'),
  query('sort').optional().isIn(['created_at', 'document_date', 'quantity', 'total_price']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

// Валидация ID параметра
const materialIdValidation = [
  param('id').isUUID().withMessage('Valid material ID is required')
];

const operationIdValidation = [
  param('id').isUUID().withMessage('Valid operation ID is required')
];

// Основные маршруты для материалов
router.get('/', getMaterialsValidation, validate, getMaterials);
router.post('/', authorize(['admin', 'manager']), createMaterialValidation, validate, createMaterial);

router.get('/:id', materialIdValidation, validate, getMaterial);
router.put('/:id', authorize(['admin', 'manager']), updateMaterialValidation, validate, updateMaterial);
router.delete('/:id', authorize(['admin', 'manager']), materialIdValidation, validate, deleteMaterial);

// Маршруты для складских операций
router.get('/warehouse/operations', getWarehouseOperationsValidation, validate, getWarehouseOperations);
router.post('/warehouse/operations', warehouseOperationValidation, validate, createWarehouseOperation);
router.put('/warehouse/operations/:id', warehouseOperationValidation, validate, updateWarehouseOperation);
router.delete('/warehouse/operations/:id', authorize(['admin', 'manager']), operationIdValidation, validate, deleteWarehouseOperation);

// Маршруты для остатков материалов
router.get('/stock/list', getMaterialStock);
router.post('/stock/reserve', reserveMaterialValidation, validate, reserveMaterial);
router.post('/stock/unreserve', reserveMaterialValidation, validate, unreserveMaterial);

// Маршруты для статистики и отчетов
router.get('/stats/warehouse', getWarehouseStats);
router.get('/reports/movement', getMaterialMovementReport);

export default router;