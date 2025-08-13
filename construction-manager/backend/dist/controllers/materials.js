"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreserveMaterial = exports.reserveMaterial = exports.getMaterialMovementReport = exports.getWarehouseStats = exports.getMaterialStock = exports.deleteWarehouseOperation = exports.updateWarehouseOperation = exports.createWarehouseOperation = exports.getWarehouseOperations = exports.deleteMaterial = exports.updateMaterial = exports.createMaterial = exports.getMaterial = exports.getMaterials = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
exports.getMaterials = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', category, supplier, search, min_stock_alert = 'false', sort = 'name', order = 'asc' } = req.query;
    const filters = {};
    if (category)
        filters.category = category;
    if (supplier)
        filters.supplier = supplier;
    if (search)
        filters.search = search;
    let result = await supabase_1.dbService.getPaginated('materials', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
    if (min_stock_alert === 'true') {
        const { data: lowStockMaterials } = await supabase_1.supabase
            .from('materials')
            .select(`
        *,
        material_stock!inner(current_stock)
      `)
            .lt('material_stock.current_stock', supabase_1.supabase.raw('materials.min_stock'));
        result.data = lowStockMaterials || [];
        result.total = lowStockMaterials?.length || 0;
    }
    res.json({
        success: true,
        data: result.data,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
});
exports.getMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { data: material, error } = await supabase_1.supabase
        .from('materials')
        .select(`
      *,
      material_stock(
        current_stock,
        reserved_stock,
        last_updated,
        projects(name)
      )
    `)
        .eq('id', id)
        .single();
    if (error || !material) {
        throw new errorHandler_1.AppError('Material not found', 404);
    }
    res.json({
        success: true,
        data: material
    });
});
exports.createMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    if (!req.body.code) {
        const { count } = await supabase_1.supabase
            .from('materials')
            .select('*', { count: 'exact', head: true });
        req.body.code = `MAT${String((count || 0) + 1).padStart(4, '0')}`;
    }
    const material = await supabase_1.dbService.create('materials', req.body);
    (0, logger_1.logInfo)('Material created', { materialId: material.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Material created successfully',
        data: material
    });
});
exports.updateMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const material = await supabase_1.dbService.update('materials', id, req.body);
    (0, logger_1.logInfo)('Material updated', { materialId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Material updated successfully',
        data: material
    });
});
exports.deleteMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { count } = await supabase_1.supabase
        .from('warehouse_operations')
        .select('*', { count: 'exact', head: true })
        .eq('material_id', id);
    if (count && count > 0) {
        throw new errorHandler_1.AppError('Cannot delete material with existing warehouse operations', 400);
    }
    await supabase_1.dbService.delete('materials', id);
    (0, logger_1.logInfo)('Material deleted', { materialId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Material deleted successfully'
    });
});
exports.getWarehouseOperations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', material_id, project_id, operation_type, date_from, date_to, sort = 'created_at', order = 'desc' } = req.query;
    const filters = {};
    if (material_id)
        filters.material_id = material_id;
    if (project_id)
        filters.project_id = project_id;
    if (operation_type)
        filters.operation_type = operation_type;
    if (date_from)
        filters.date_from = date_from;
    if (date_to)
        filters.date_to = date_to;
    const result = await supabase_1.dbService.getPaginated('warehouse_operations', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
    res.json({
        success: true,
        data: result.data,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
});
exports.createWarehouseOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const operationData = {
        ...req.body,
        responsible_id: req.user.id,
        document_date: req.body.document_date || new Date().toISOString().split('T')[0]
    };
    if (!operationData.total_price && operationData.quantity && operationData.unit_price) {
        operationData.total_price = operationData.quantity * operationData.unit_price;
    }
    const operation = await supabase_1.dbService.create('warehouse_operations', operationData);
    (0, logger_1.logInfo)('Warehouse operation created', { operationId: operation.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Warehouse operation created successfully',
        data: operation
    });
});
exports.updateWarehouseOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (req.body.quantity || req.body.unit_price) {
        const currentOperation = await supabase_1.dbService.getById('warehouse_operations', id);
        if (currentOperation) {
            const quantity = req.body.quantity || currentOperation.quantity;
            const unitPrice = req.body.unit_price || currentOperation.unit_price;
            req.body.total_price = quantity * unitPrice;
        }
    }
    const operation = await supabase_1.dbService.update('warehouse_operations', id, req.body);
    (0, logger_1.logInfo)('Warehouse operation updated', { operationId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Warehouse operation updated successfully',
        data: operation
    });
});
exports.deleteWarehouseOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await supabase_1.dbService.delete('warehouse_operations', id);
    (0, logger_1.logInfo)('Warehouse operation deleted', { operationId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Warehouse operation deleted successfully'
    });
});
exports.getMaterialStock = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', project_id, material_id, low_stock = 'false', sort = 'current_stock', order = 'asc' } = req.query;
    let query = supabase_1.supabase
        .from('material_stock')
        .select(`
      *,
      materials(name, code, unit, min_stock),
      projects(name)
    `);
    if (project_id)
        query = query.eq('project_id', project_id);
    if (material_id)
        query = query.eq('material_id', material_id);
    if (low_stock === 'true') {
        query = query.lt('current_stock', supabase_1.supabase.raw('materials.min_stock'));
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    const { data: stock, error, count } = await query;
    if (error) {
        throw new errorHandler_1.AppError(`Failed to fetch material stock: ${error.message}`, 400);
    }
    const total = count || 0;
    const totalPages = Math.ceil(total / parseInt(limit));
    res.json({
        success: true,
        data: stock || [],
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
        }
    });
});
exports.getWarehouseStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id, date_from, date_to } = req.query;
    let operationsQuery = supabase_1.supabase.from('warehouse_operations').select('*');
    if (project_id)
        operationsQuery = operationsQuery.eq('project_id', project_id);
    if (date_from)
        operationsQuery = operationsQuery.gte('document_date', date_from);
    if (date_to)
        operationsQuery = operationsQuery.lte('document_date', date_to);
    const { data: operations } = await operationsQuery;
    const [{ count: totalMaterials }, { count: lowStockMaterials }, { data: stockData }] = await Promise.all([
        supabase_1.supabase.from('materials').select('*', { count: 'exact', head: true }),
        supabase_1.supabase.from('material_stock').select('*, materials!inner(min_stock)', { count: 'exact', head: true })
            .lt('current_stock', supabase_1.supabase.raw('materials.min_stock')),
        supabase_1.supabase.from('material_stock').select('current_stock, reserved_stock')
    ]);
    const stats = {
        materials: {
            total: totalMaterials || 0,
            low_stock: lowStockMaterials || 0
        },
        operations: {
            total: operations?.length || 0,
            receipts: operations?.filter(op => op.operation_type === 'receipt').length || 0,
            consumptions: operations?.filter(op => op.operation_type === 'consumption').length || 0,
            transfers: operations?.filter(op => op.operation_type === 'transfer').length || 0,
            write_offs: operations?.filter(op => op.operation_type === 'write_off').length || 0
        },
        stock: {
            total_value: operations?.reduce((sum, op) => sum + (Number(op.total_price) || 0), 0) || 0,
            current_stock_items: stockData?.reduce((sum, item) => sum + (item.current_stock || 0), 0) || 0,
            reserved_stock_items: stockData?.reduce((sum, item) => sum + (item.reserved_stock || 0), 0) || 0
        },
        categories: {}
    };
    const { data: categories } = await supabase_1.supabase
        .from('materials')
        .select('category')
        .not('category', 'is', null);
    categories?.forEach(item => {
        if (item.category) {
            stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
        }
    });
    res.json({
        success: true,
        data: stats
    });
});
exports.getMaterialMovementReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { material_id, project_id, date_from, date_to } = req.query;
    if (!material_id) {
        throw new errorHandler_1.AppError('Material ID is required', 400);
    }
    let query = supabase_1.supabase
        .from('warehouse_operations')
        .select(`
      *,
      projects(name),
      materials(name, code, unit)
    `)
        .eq('material_id', material_id)
        .order('document_date', { ascending: true });
    if (project_id)
        query = query.eq('project_id', project_id);
    if (date_from)
        query = query.gte('document_date', date_from);
    if (date_to)
        query = query.lte('document_date', date_to);
    const { data: operations } = await query;
    let runningBalance = 0;
    const movements = operations?.map(op => {
        const quantity = Number(op.quantity);
        if (op.operation_type === 'receipt') {
            runningBalance += quantity;
        }
        else if (op.operation_type === 'consumption' || op.operation_type === 'write_off') {
            runningBalance -= quantity;
        }
        return {
            ...op,
            running_balance: runningBalance
        };
    }) || [];
    res.json({
        success: true,
        data: {
            movements,
            summary: {
                total_receipts: operations?.filter(op => op.operation_type === 'receipt')
                    .reduce((sum, op) => sum + Number(op.quantity), 0) || 0,
                total_consumptions: operations?.filter(op => op.operation_type === 'consumption')
                    .reduce((sum, op) => sum + Number(op.quantity), 0) || 0,
                final_balance: runningBalance
            }
        }
    });
});
exports.reserveMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { material_id, project_id, quantity } = req.body;
    if (!material_id || !project_id || !quantity || quantity <= 0) {
        throw new errorHandler_1.AppError('Material ID, project ID, and positive quantity are required', 400);
    }
    const { data: stock } = await supabase_1.supabase
        .from('material_stock')
        .select('*')
        .eq('material_id', material_id)
        .eq('project_id', project_id)
        .single();
    if (!stock) {
        throw new errorHandler_1.AppError('Material stock not found for this project', 404);
    }
    const availableQuantity = stock.current_stock - stock.reserved_stock;
    if (quantity > availableQuantity) {
        throw new errorHandler_1.AppError(`Insufficient stock. Available: ${availableQuantity}`, 400);
    }
    const { data: updatedStock } = await supabase_1.supabase
        .from('material_stock')
        .update({
        reserved_stock: stock.reserved_stock + quantity,
        last_updated: new Date().toISOString()
    })
        .eq('material_id', material_id)
        .eq('project_id', project_id)
        .select()
        .single();
    (0, logger_1.logInfo)('Material reserved', {
        materialId: material_id,
        projectId: project_id,
        quantity,
        userId: req.user?.id
    });
    res.json({
        success: true,
        message: 'Material reserved successfully',
        data: updatedStock
    });
});
exports.unreserveMaterial = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { material_id, project_id, quantity } = req.body;
    if (!material_id || !project_id || !quantity || quantity <= 0) {
        throw new errorHandler_1.AppError('Material ID, project ID, and positive quantity are required', 400);
    }
    const { data: stock } = await supabase_1.supabase
        .from('material_stock')
        .select('*')
        .eq('material_id', material_id)
        .eq('project_id', project_id)
        .single();
    if (!stock) {
        throw new errorHandler_1.AppError('Material stock not found for this project', 404);
    }
    if (quantity > stock.reserved_stock) {
        throw new errorHandler_1.AppError(`Cannot unreserve more than reserved. Reserved: ${stock.reserved_stock}`, 400);
    }
    const { data: updatedStock } = await supabase_1.supabase
        .from('material_stock')
        .update({
        reserved_stock: Math.max(0, stock.reserved_stock - quantity),
        last_updated: new Date().toISOString()
    })
        .eq('material_id', material_id)
        .eq('project_id', project_id)
        .select()
        .single();
    (0, logger_1.logInfo)('Material unreserved', {
        materialId: material_id,
        projectId: project_id,
        quantity,
        userId: req.user?.id
    });
    res.json({
        success: true,
        message: 'Material unreserved successfully',
        data: updatedStock
    });
});
//# sourceMappingURL=materials.js.map