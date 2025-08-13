"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const materials_1 = require("../controllers/materials");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const createMaterialValidation = [
    (0, express_validator_1.body)('name').isLength({ min: 1, max: 200 }).withMessage('Material name is required and must be max 200 characters'),
    (0, express_validator_1.body)('code').optional().isLength({ max: 50 }).withMessage('Material code must be max 50 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    (0, express_validator_1.body)('unit').isLength({ min: 1, max: 20 }).withMessage('Unit is required and must be max 20 characters'),
    (0, express_validator_1.body)('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
    (0, express_validator_1.body)('min_stock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer')
];
const updateMaterialValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid material ID is required'),
    (0, express_validator_1.body)('name').optional().isLength({ min: 1, max: 200 }).withMessage('Material name must be max 200 characters'),
    (0, express_validator_1.body)('code').optional().isLength({ max: 50 }).withMessage('Material code must be max 50 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    (0, express_validator_1.body)('unit').optional().isLength({ min: 1, max: 20 }).withMessage('Unit must be max 20 characters'),
    (0, express_validator_1.body)('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
    (0, express_validator_1.body)('min_stock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer')
];
const warehouseOperationValidation = [
    (0, express_validator_1.body)('material_id').isUUID().withMessage('Valid material ID is required'),
    (0, express_validator_1.body)('project_id').isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('operation_type').isIn(['receipt', 'consumption', 'transfer', 'write_off']).withMessage('Invalid operation type'),
    (0, express_validator_1.body)('quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be a positive number'),
    (0, express_validator_1.body)('unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
    (0, express_validator_1.body)('total_price').optional().isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
    (0, express_validator_1.body)('document_number').optional().isLength({ max: 100 }).withMessage('Document number must be max 100 characters'),
    (0, express_validator_1.body)('document_date').optional().isISO8601().withMessage('Valid document date is required'),
    (0, express_validator_1.body)('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
    (0, express_validator_1.body)('notes').optional().isLength({ max: 500 }).withMessage('Notes must be max 500 characters')
];
const reserveMaterialValidation = [
    (0, express_validator_1.body)('material_id').isUUID().withMessage('Valid material ID is required'),
    (0, express_validator_1.body)('project_id').isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be a positive number')
];
const getMaterialsValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('category').optional().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
    (0, express_validator_1.query)('supplier').optional().isLength({ max: 200 }).withMessage('Supplier must be max 200 characters'),
    (0, express_validator_1.query)('search').optional().isLength({ max: 100 }).withMessage('Search must be max 100 characters'),
    (0, express_validator_1.query)('min_stock_alert').optional().isIn(['true', 'false']).withMessage('Min stock alert must be true or false'),
    (0, express_validator_1.query)('sort').optional().isIn(['name', 'code', 'category', 'price', 'min_stock', 'created_at']).withMessage('Invalid sort field'),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];
const getWarehouseOperationsValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('material_id').optional().isUUID().withMessage('Valid material ID is required'),
    (0, express_validator_1.query)('project_id').optional().isUUID().withMessage('Valid project ID is required'),
    (0, express_validator_1.query)('operation_type').optional().isIn(['receipt', 'consumption', 'transfer', 'write_off']).withMessage('Invalid operation type'),
    (0, express_validator_1.query)('date_from').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('date_to').optional().isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.query)('sort').optional().isIn(['created_at', 'document_date', 'quantity', 'total_price']).withMessage('Invalid sort field'),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];
const materialIdValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid material ID is required')
];
const operationIdValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid operation ID is required')
];
router.get('/', getMaterialsValidation, validation_1.validate, materials_1.getMaterials);
router.post('/', (0, auth_1.authorize)(['admin', 'manager']), createMaterialValidation, validation_1.validate, materials_1.createMaterial);
router.get('/:id', materialIdValidation, validation_1.validate, materials_1.getMaterial);
router.put('/:id', (0, auth_1.authorize)(['admin', 'manager']), updateMaterialValidation, validation_1.validate, materials_1.updateMaterial);
router.delete('/:id', (0, auth_1.authorize)(['admin', 'manager']), materialIdValidation, validation_1.validate, materials_1.deleteMaterial);
router.get('/warehouse/operations', getWarehouseOperationsValidation, validation_1.validate, materials_1.getWarehouseOperations);
router.post('/warehouse/operations', warehouseOperationValidation, validation_1.validate, materials_1.createWarehouseOperation);
router.put('/warehouse/operations/:id', warehouseOperationValidation, validation_1.validate, materials_1.updateWarehouseOperation);
router.delete('/warehouse/operations/:id', (0, auth_1.authorize)(['admin', 'manager']), operationIdValidation, validation_1.validate, materials_1.deleteWarehouseOperation);
router.get('/stock/list', materials_1.getMaterialStock);
router.post('/stock/reserve', reserveMaterialValidation, validation_1.validate, materials_1.reserveMaterial);
router.post('/stock/unreserve', reserveMaterialValidation, validation_1.validate, materials_1.unreserveMaterial);
router.get('/stats/warehouse', materials_1.getWarehouseStats);
router.get('/reports/movement', materials_1.getMaterialMovementReport);
exports.default = router;
//# sourceMappingURL=materials.js.map