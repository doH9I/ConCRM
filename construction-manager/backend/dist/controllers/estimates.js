"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyEstimate = exports.exportEstimateToExcel = exports.importEstimateFromExcel = exports.deleteEstimateItem = exports.updateEstimateItem = exports.addEstimateItem = exports.getEstimateItems = exports.approveEstimate = exports.deleteEstimate = exports.updateEstimate = exports.createEstimate = exports.getEstimate = exports.getEstimates = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
const ExcelJS = __importStar(require("exceljs"));
exports.getEstimates = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', project_id, status, search, sort = 'created_at', order = 'desc' } = req.query;
    const filters = {};
    if (project_id)
        filters.project_id = project_id;
    if (status)
        filters.status = status;
    if (search)
        filters.search = search;
    const result = await supabase_1.dbService.getPaginated('estimates', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.getEstimate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { data: estimate, error } = await supabase_1.supabase
        .from('estimates')
        .select(`
      *,
      projects(name),
      estimate_items(*)
    `)
        .eq('id', id)
        .single();
    if (error || !estimate) {
        throw new errorHandler_1.AppError('Estimate not found', 404);
    }
    res.json({
        success: true,
        data: estimate
    });
});
exports.createEstimate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    if (!req.body.number) {
        const { count } = await supabase_1.supabase
            .from('estimates')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', req.body.project_id);
        req.body.number = `EST-${String((count || 0) + 1).padStart(3, '0')}`;
    }
    const estimateData = {
        ...req.body,
        created_by: req.user.id,
        total_amount: 0,
        labor_cost: 0,
        material_cost: 0,
        equipment_cost: 0
    };
    const estimate = await supabase_1.dbService.create('estimates', estimateData);
    (0, logger_1.logInfo)('Estimate created', { estimateId: estimate.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Estimate created successfully',
        data: estimate
    });
});
exports.updateEstimate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const estimate = await supabase_1.dbService.update('estimates', id, req.body);
    (0, logger_1.logInfo)('Estimate updated', { estimateId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Estimate updated successfully',
        data: estimate
    });
});
exports.deleteEstimate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { count } = await supabase_1.supabase
        .from('ks_items')
        .select('*', { count: 'exact', head: true })
        .not('estimate_item_id', 'is', null)
        .in('estimate_item_id', supabase_1.supabase.from('estimate_items').select('id').eq('estimate_id', id));
    if (count && count > 0) {
        throw new errorHandler_1.AppError('Cannot delete estimate with linked KS reports', 400);
    }
    await supabase_1.dbService.delete('estimates', id);
    (0, logger_1.logInfo)('Estimate deleted', { estimateId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Estimate deleted successfully'
    });
});
exports.approveEstimate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { id } = req.params;
    const estimate = await supabase_1.dbService.update('estimates', id, {
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date().toISOString()
    });
    (0, logger_1.logInfo)('Estimate approved', { estimateId: id, approvedBy: req.user.id });
    res.json({
        success: true,
        message: 'Estimate approved successfully',
        data: estimate
    });
});
exports.getEstimateItems = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { estimate_id } = req.params;
    const { page = '1', limit = '50', category, sort = 'order_number', order = 'asc' } = req.query;
    const filters = {
        estimate_id
    };
    if (category)
        filters.category = category;
    const result = await supabase_1.dbService.getPaginated('estimate_items', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.addEstimateItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { estimate_id } = req.params;
    if (!req.body.order_number) {
        const { count } = await supabase_1.supabase
            .from('estimate_items')
            .select('*', { count: 'exact', head: true })
            .eq('estimate_id', estimate_id);
        req.body.order_number = (count || 0) + 1;
    }
    const itemData = {
        ...req.body,
        estimate_id,
        total_price: req.body.quantity * req.body.unit_price
    };
    const item = await supabase_1.dbService.create('estimate_items', itemData);
    await recalculateEstimateTotal(estimate_id);
    (0, logger_1.logInfo)('Estimate item added', { estimateId: estimate_id, itemId: item.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Estimate item added successfully',
        data: item
    });
});
exports.updateEstimateItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (req.body.quantity || req.body.unit_price) {
        const currentItem = await supabase_1.dbService.getById('estimate_items', id);
        if (currentItem) {
            const quantity = req.body.quantity || currentItem.quantity;
            const unitPrice = req.body.unit_price || currentItem.unit_price;
            req.body.total_price = quantity * unitPrice;
        }
    }
    const item = await supabase_1.dbService.update('estimate_items', id, req.body);
    await recalculateEstimateTotal(item.estimate_id);
    (0, logger_1.logInfo)('Estimate item updated', { itemId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Estimate item updated successfully',
        data: item
    });
});
exports.deleteEstimateItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const item = await supabase_1.dbService.getById('estimate_items', id);
    if (!item) {
        throw new errorHandler_1.AppError('Estimate item not found', 404);
    }
    await supabase_1.dbService.delete('estimate_items', id);
    await recalculateEstimateTotal(item.estimate_id);
    (0, logger_1.logInfo)('Estimate item deleted', { itemId: id, estimateId: item.estimate_id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Estimate item deleted successfully'
    });
});
exports.importEstimateFromExcel = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { estimate_id } = req.params;
    if (!req.file) {
        throw new errorHandler_1.AppError('Excel file is required', 400);
    }
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.getWorksheet(1);
        const items = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const values = row.values;
                if (values.length >= 6 && values[2] && values[3] && values[4] && values[5]) {
                    items.push({
                        estimate_id,
                        order_number: values[1] || rowNumber - 1,
                        name: values[2],
                        unit: values[3],
                        quantity: Number(values[4]) || 0,
                        unit_price: Number(values[5]) || 0,
                        total_price: (Number(values[4]) || 0) * (Number(values[5]) || 0),
                        category: values[6] || 'Общие работы',
                        labor_cost: Number(values[7]) || 0,
                        material_cost: Number(values[8]) || 0,
                        equipment_cost: Number(values[9]) || 0,
                        notes: values[10] || ''
                    });
                }
            }
        });
        if (items.length === 0) {
            throw new errorHandler_1.AppError('No valid items found in Excel file', 400);
        }
        await supabase_1.supabase
            .from('estimate_items')
            .delete()
            .eq('estimate_id', estimate_id);
        const { data: insertedItems, error } = await supabase_1.supabase
            .from('estimate_items')
            .insert(items)
            .select();
        if (error) {
            throw new errorHandler_1.AppError(`Failed to import items: ${error.message}`, 400);
        }
        await recalculateEstimateTotal(estimate_id);
        (0, logger_1.logInfo)('Estimate imported from Excel', {
            estimateId: estimate_id,
            itemsCount: items.length,
            userId: req.user.id
        });
        res.json({
            success: true,
            message: `Successfully imported ${items.length} items from Excel`,
            data: {
                imported_items: items.length,
                items: insertedItems
            }
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(`Failed to process Excel file: ${error.message}`, 400);
    }
});
exports.exportEstimateToExcel = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { data: estimate, error } = await supabase_1.supabase
        .from('estimates')
        .select(`
      *,
      projects(name),
      estimate_items(*)
    `)
        .eq('id', id)
        .single();
    if (error || !estimate) {
        throw new errorHandler_1.AppError('Estimate not found', 404);
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Смета');
    const headers = [
        'Номер', 'Наименование работ', 'Ед.изм.', 'Количество',
        'Цена за ед.', 'Общая стоимость', 'Трудозатраты',
        'Стоимость материалов', 'Стоимость оборудования', 'Примечания'
    ];
    worksheet.addRow(headers);
    estimate.estimate_items.forEach((item) => {
        worksheet.addRow([
            item.order_number,
            item.name,
            item.unit,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.labor_cost || 0,
            item.material_cost || 0,
            item.equipment_cost || 0,
            item.notes || ''
        ]);
    });
    worksheet.addRow([
        '',
        'ИТОГО:',
        '',
        '',
        '',
        estimate.total_amount || 0,
        estimate.labor_cost || 0,
        estimate.material_cost || 0,
        estimate.equipment_cost || 0,
        ''
    ]);
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=estimate_${estimate.number || id}.xlsx`);
    res.send(buffer);
});
exports.copyEstimate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { id } = req.params;
    const { name, project_id } = req.body;
    const { data: originalEstimate, error } = await supabase_1.supabase
        .from('estimates')
        .select(`
      *,
      estimate_items(*)
    `)
        .eq('id', id)
        .single();
    if (error || !originalEstimate) {
        throw new errorHandler_1.AppError('Original estimate not found', 404);
    }
    const newEstimateData = {
        ...originalEstimate,
        id: undefined,
        name: name || `${originalEstimate.name} (копия)`,
        project_id: project_id || originalEstimate.project_id,
        number: undefined,
        version: 1,
        status: 'draft',
        created_by: req.user.id,
        approved_by: null,
        approved_at: null,
        created_at: undefined,
        updated_at: undefined
    };
    const newEstimate = await supabase_1.dbService.create('estimates', newEstimateData);
    if (originalEstimate.estimate_items && originalEstimate.estimate_items.length > 0) {
        const newItems = originalEstimate.estimate_items.map((item) => ({
            ...item,
            id: undefined,
            estimate_id: newEstimate.id,
            created_at: undefined
        }));
        await supabase_1.supabase
            .from('estimate_items')
            .insert(newItems);
    }
    (0, logger_1.logInfo)('Estimate copied', {
        originalId: id,
        newId: newEstimate.id,
        userId: req.user.id
    });
    res.status(201).json({
        success: true,
        message: 'Estimate copied successfully',
        data: newEstimate
    });
});
async function recalculateEstimateTotal(estimateId) {
    const { data: items } = await supabase_1.supabase
        .from('estimate_items')
        .select('total_price, labor_cost, material_cost, equipment_cost')
        .eq('estimate_id', estimateId);
    if (items) {
        const totals = items.reduce((acc, item) => ({
            total_amount: acc.total_amount + (Number(item.total_price) || 0),
            labor_cost: acc.labor_cost + (Number(item.labor_cost) || 0),
            material_cost: acc.material_cost + (Number(item.material_cost) || 0),
            equipment_cost: acc.equipment_cost + (Number(item.equipment_cost) || 0)
        }), {
            total_amount: 0,
            labor_cost: 0,
            material_cost: 0,
            equipment_cost: 0
        });
        await supabase_1.supabase
            .from('estimates')
            .update(totals)
            .eq('id', estimateId);
    }
}
//# sourceMappingURL=estimates.js.map