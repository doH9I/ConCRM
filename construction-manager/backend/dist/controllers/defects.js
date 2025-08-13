"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDefectPhotos = exports.getDefectStats = exports.reopenDefect = exports.resolveDefect = exports.assignDefect = exports.deleteDefect = exports.updateDefect = exports.createDefect = exports.getDefect = exports.getDefects = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
exports.getDefects = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', project_id, status, severity, assigned_to, search, sort = 'created_at', order = 'desc' } = req.query;
    const filters = {};
    if (project_id)
        filters.project_id = project_id;
    if (status)
        filters.status = status;
    if (severity)
        filters.severity = severity;
    if (assigned_to)
        filters.assigned_to = assigned_to;
    if (search)
        filters.search = search;
    const result = await supabase_1.dbService.getPaginated('defects', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.getDefect = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { data: defect, error } = await supabase_1.supabase
        .from('defects')
        .select(`
      *,
      projects(name),
      found_by_profile:profiles!defects_found_by_fkey(full_name),
      assigned_to_profile:profiles!defects_assigned_to_fkey(full_name)
    `)
        .eq('id', id)
        .single();
    if (error || !defect) {
        throw new errorHandler_1.AppError('Defect not found', 404);
    }
    res.json({
        success: true,
        data: defect
    });
});
exports.createDefect = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const defectData = {
        ...req.body,
        found_by: req.user.id,
        status: 'open'
    };
    const defect = await supabase_1.dbService.create('defects', defectData);
    (0, logger_1.logInfo)('Defect created', { defectId: defect.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        data: defect
    });
});
exports.updateDefect = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const defect = await supabase_1.dbService.update('defects', id, req.body);
    (0, logger_1.logInfo)('Defect updated', { defectId: id, userId: req.user?.id });
    res.json({
        success: true,
        data: defect
    });
});
exports.deleteDefect = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await supabase_1.dbService.delete('defects', id);
    (0, logger_1.logInfo)('Defect deleted', { defectId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Defect deleted successfully'
    });
});
exports.assignDefect = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { assigned_to } = req.body;
    if (!assigned_to) {
        throw new errorHandler_1.AppError('assigned_to is required', 400);
    }
    const defect = await supabase_1.dbService.update('defects', id, {
        assigned_to,
        status: 'in_progress'
    });
    (0, logger_1.logInfo)('Defect assigned', { defectId: id, assignedTo: assigned_to, userId: req.user?.id });
    res.json({
        success: true,
        data: defect
    });
});
exports.resolveDefect = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { resolution_notes } = req.body;
    const defect = await supabase_1.dbService.update('defects', id, {
        status: 'resolved',
        resolution_notes,
        resolved_at: new Date().toISOString()
    });
    (0, logger_1.logInfo)('Defect resolved', { defectId: id, userId: req.user?.id });
    res.json({
        success: true,
        data: defect
    });
});
exports.reopenDefect = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const defect = await supabase_1.dbService.update('defects', id, {
        status: 'open',
        resolved_at: undefined,
        resolution_notes: undefined
    });
    (0, logger_1.logInfo)('Defect reopened', { defectId: id, userId: req.user?.id });
    res.json({
        success: true,
        data: defect
    });
});
exports.getDefectStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id } = req.query;
    let query = supabase_1.supabase.from('defects').select('status, severity');
    if (project_id) {
        query = query.eq('project_id', project_id);
    }
    const { data: defects, error } = await query;
    if (error) {
        throw new errorHandler_1.AppError('Failed to fetch defect statistics', 500);
    }
    const stats = {
        total: defects.length,
        by_status: defects.reduce((acc, defect) => {
            acc[defect.status] = (acc[defect.status] || 0) + 1;
            return acc;
        }, {}),
        by_severity: defects.reduce((acc, defect) => {
            acc[defect.severity] = (acc[defect.severity] || 0) + 1;
            return acc;
        }, {})
    };
    res.json({
        success: true,
        data: stats
    });
});
exports.uploadDefectPhotos = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { photo_urls } = req.body;
    if (!photo_urls || !Array.isArray(photo_urls)) {
        throw new errorHandler_1.AppError('photo_urls array is required', 400);
    }
    const { data: currentDefect } = await supabase_1.supabase
        .from('defects')
        .select('photo_urls')
        .eq('id', id)
        .single();
    const existingPhotos = currentDefect?.photo_urls || [];
    const updatedPhotos = [...existingPhotos, ...photo_urls];
    const defect = await supabase_1.dbService.update('defects', id, {
        photo_urls: updatedPhotos
    });
    (0, logger_1.logInfo)('Defect photos uploaded', { defectId: id, photoCount: photo_urls.length, userId: req.user?.id });
    res.json({
        success: true,
        data: defect
    });
});
//# sourceMappingURL=defects.js.map