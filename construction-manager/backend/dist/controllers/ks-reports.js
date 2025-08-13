"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKsFromEstimate = exports.exportKsReportToPDF = exports.approveKsReport = exports.deleteKsItem = exports.updateKsItem = exports.addKsItem = exports.deleteKsReport = exports.updateKsReport = exports.createKsReport = exports.getKsReport = exports.getKsReports = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
exports.getKsReports = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', project_id, type, status, search, sort = 'created_at', order = 'desc' } = req.query;
    const filters = {};
    if (project_id)
        filters.project_id = project_id;
    if (type)
        filters.type = type;
    if (status)
        filters.status = status;
    if (search)
        filters.search = search;
    const result = await supabase_1.dbService.getPaginated('ks_reports', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.getKsReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { data: ksReport, error } = await supabase_1.supabase
        .from('ks_reports')
        .select(`
      *,
      projects(name),
      ks_items(*),
      created_by_profile:profiles!ks_reports_created_by_fkey(full_name),
      approved_by_profile:profiles!ks_reports_approved_by_fkey(full_name)
    `)
        .eq('id', id)
        .single();
    if (error || !ksReport) {
        throw new errorHandler_1.AppError('KS Report not found', 404);
    }
    res.json({
        success: true,
        data: ksReport
    });
});
exports.createKsReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    if (!req.body.number) {
        const { count } = await supabase_1.supabase
            .from('ks_reports')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', req.body.project_id)
            .eq('type', req.body.type);
        const typePrefix = req.body.type.toUpperCase();
        req.body.number = `${typePrefix}-${String((count || 0) + 1).padStart(3, '0')}`;
    }
    const ksReportData = {
        ...req.body,
        created_by: req.user.id,
        status: 'draft',
        total_amount: 0,
        previous_amount: 0,
        current_amount: 0
    };
    const ksReport = await supabase_1.dbService.create('ks_reports', ksReportData);
    (0, logger_1.logInfo)('KS Report created', { ksReportId: ksReport.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        data: ksReport
    });
});
exports.updateKsReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const ksReport = await supabase_1.dbService.update('ks_reports', id, req.body);
    (0, logger_1.logInfo)('KS Report updated', { ksReportId: id, userId: req.user?.id });
    res.json({
        success: true,
        data: ksReport
    });
});
exports.deleteKsReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await supabase_1.dbService.delete('ks_reports', id);
    (0, logger_1.logInfo)('KS Report deleted', { ksReportId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'KS Report deleted successfully'
    });
});
exports.addKsItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const itemData = {
        ...req.body,
        ks_report_id: id
    };
    const item = await supabase_1.dbService.create('ks_items', itemData);
    await recalculateKsTotals(id);
    (0, logger_1.logInfo)('KS Item added', { ksReportId: id, itemId: item.id, userId: req.user?.id });
    res.status(201).json({
        success: true,
        data: item
    });
});
exports.updateKsItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id, itemId } = req.params;
    const item = await supabase_1.dbService.update('ks_items', itemId, req.body);
    await recalculateKsTotals(id);
    (0, logger_1.logInfo)('KS Item updated', { ksReportId: id, itemId, userId: req.user?.id });
    res.json({
        success: true,
        data: item
    });
});
exports.deleteKsItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id, itemId } = req.params;
    await supabase_1.dbService.delete('ks_items', itemId);
    await recalculateKsTotals(id);
    (0, logger_1.logInfo)('KS Item deleted', { ksReportId: id, itemId, userId: req.user?.id });
    res.json({
        success: true,
        message: 'KS Item deleted successfully'
    });
});
exports.approveKsReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const ksReport = await supabase_1.dbService.update('ks_reports', id, {
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date().toISOString()
    });
    (0, logger_1.logInfo)('KS Report approved', { ksReportId: id, userId: req.user.id });
    res.json({
        success: true,
        data: ksReport
    });
});
exports.exportKsReportToPDF = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    res.json({
        success: true,
        message: 'KS Report PDF export functionality coming soon',
        data: { ksReportId: id }
    });
});
exports.generateKsFromEstimate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { estimateId } = req.params;
    const { type, period_start, period_end } = req.body;
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { data: estimate, error } = await supabase_1.supabase
        .from('estimates')
        .select(`
      *,
      estimate_items(*)
    `)
        .eq('id', estimateId)
        .single();
    if (error || !estimate) {
        throw new errorHandler_1.AppError('Estimate not found', 404);
    }
    const ksReportData = {
        project_id: estimate.project_id,
        type,
        number: '',
        date: new Date().toISOString().split('T')[0],
        period_start,
        period_end,
        contractor_name: 'ООО "Строитель"',
        customer_name: 'Заказчик',
        contract_number: 'Договор №1',
        contract_date: new Date().toISOString().split('T')[0],
        created_by: req.user.id
    };
    const ksReport = await supabase_1.dbService.create('ks_reports', ksReportData);
    for (const estimateItem of estimate.estimate_items) {
        await supabase_1.dbService.create('ks_items', {
            ks_report_id: ksReport.id,
            estimate_item_id: estimateItem.id,
            order_number: estimateItem.order_number,
            name: estimateItem.name,
            unit: estimateItem.unit,
            total_quantity: estimateItem.quantity,
            previous_quantity: 0,
            current_quantity: estimateItem.quantity,
            unit_price: estimateItem.unit_price,
            total_amount: estimateItem.total_price,
            previous_amount: 0,
            current_amount: estimateItem.total_price
        });
    }
    await recalculateKsTotals(ksReport.id);
    (0, logger_1.logInfo)('KS Report generated from estimate', {
        ksReportId: ksReport.id,
        estimateId,
        userId: req.user.id
    });
    res.status(201).json({
        success: true,
        data: ksReport
    });
});
async function recalculateKsTotals(ksReportId) {
    const { data: items } = await supabase_1.supabase
        .from('ks_items')
        .select('*')
        .eq('ks_report_id', ksReportId);
    if (!items)
        return;
    const totals = items.reduce((acc, item) => ({
        total_amount: acc.total_amount + Number(item.total_amount || 0),
        previous_amount: acc.previous_amount + Number(item.previous_amount || 0),
        current_amount: acc.current_amount + Number(item.current_amount || 0)
    }), { total_amount: 0, previous_amount: 0, current_amount: 0 });
    await supabase_1.dbService.update('ks_reports', ksReportId, totals);
}
//# sourceMappingURL=ks-reports.js.map