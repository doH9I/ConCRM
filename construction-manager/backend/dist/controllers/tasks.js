"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksStatistics = exports.addTimeToTask = exports.updateTaskStatus = exports.getOverdueTasks = exports.getMyTasks = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTask = exports.getTasks = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
exports.getTasks = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', project_id, stage_id, status, priority, assigned_to, due_date_from, due_date_to, sort = 'created_at', order = 'desc' } = req.query;
    const filters = {};
    if (project_id)
        filters.project_id = project_id;
    if (stage_id)
        filters.stage_id = stage_id;
    if (status)
        filters.status = status;
    if (priority)
        filters.priority = priority;
    if (assigned_to)
        filters.assigned_to = assigned_to;
    if (due_date_from)
        filters.due_date_from = due_date_from;
    if (due_date_to)
        filters.due_date_to = due_date_to;
    const result = await supabase_1.dbService.getPaginated('tasks', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.getTask = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const task = await supabase_1.dbService.getById('tasks', id);
    if (!task) {
        throw new errorHandler_1.AppError('Task not found', 404);
    }
    res.json({
        success: true,
        data: task
    });
});
exports.createTask = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const taskData = {
        ...req.body,
        created_by: req.user.id,
        actual_hours: 0
    };
    const task = await supabase_1.dbService.create('tasks', taskData);
    (0, logger_1.logInfo)('Task created', { taskId: task.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
    });
});
exports.updateTask = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (req.body.status === 'completed' && !req.body.completed_at) {
        req.body.completed_at = new Date().toISOString();
    }
    const task = await supabase_1.dbService.update('tasks', id, req.body);
    (0, logger_1.logInfo)('Task updated', { taskId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Task updated successfully',
        data: task
    });
});
exports.deleteTask = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await supabase_1.dbService.delete('tasks', id);
    (0, logger_1.logInfo)('Task deleted', { taskId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Task deleted successfully'
    });
});
exports.getMyTasks = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { page = '1', limit = '10', status, priority, project_id, sort = 'due_date', order = 'asc' } = req.query;
    const filters = {
        assigned_to: req.user.id
    };
    if (status)
        filters.status = status;
    if (priority)
        filters.priority = priority;
    if (project_id)
        filters.project_id = project_id;
    const result = await supabase_1.dbService.getPaginated('tasks', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.getOverdueTasks = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', project_id, assigned_to } = req.query;
    let query = supabase_1.supabase.from('tasks')
        .select('*', { count: 'exact' })
        .lt('due_date', new Date().toISOString().split('T')[0])
        .not('status', 'in', '(completed,cancelled)');
    if (project_id) {
        query = query.eq('project_id', project_id);
    }
    if (assigned_to) {
        query = query.eq('assigned_to', assigned_to);
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    const { data, error, count } = await query;
    if (error) {
        throw new errorHandler_1.AppError(`Failed to fetch overdue tasks: ${error.message}`, 400);
    }
    const total = count || 0;
    const totalPages = Math.ceil(total / parseInt(limit));
    res.json({
        success: true,
        data: data || [],
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
        }
    });
});
exports.updateTaskStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        throw new errorHandler_1.AppError('Status is required', 400);
    }
    const updateData = { status };
    if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
    }
    else if (status === 'in_progress' && !updateData.start_date) {
        updateData.start_date = new Date().toISOString().split('T')[0];
    }
    const task = await supabase_1.dbService.update('tasks', id, updateData);
    (0, logger_1.logInfo)('Task status updated', { taskId: id, status, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Task status updated successfully',
        data: task
    });
});
exports.addTimeToTask = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { hours } = req.body;
    if (!hours || hours <= 0) {
        throw new errorHandler_1.AppError('Valid hours amount is required', 400);
    }
    const currentTask = await supabase_1.dbService.getById('tasks', id);
    if (!currentTask) {
        throw new errorHandler_1.AppError('Task not found', 404);
    }
    const newActualHours = (currentTask.actual_hours || 0) + hours;
    const task = await supabase_1.dbService.update('tasks', id, {
        actual_hours: newActualHours
    });
    (0, logger_1.logInfo)('Time added to task', { taskId: id, hours, totalHours: newActualHours, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Time added to task successfully',
        data: task
    });
});
exports.getTasksStatistics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id } = req.query;
    let baseQuery = supabase_1.supabase.from('tasks');
    if (project_id) {
        baseQuery = baseQuery.eq('project_id', project_id);
    }
    const [{ count: totalTasks }, { count: completedTasks }, { count: inProgressTasks }, { count: overdueTasks }] = await Promise.all([
        supabase_1.supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase_1.supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase_1.supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase_1.supabase.from('tasks').select('*', { count: 'exact', head: true })
            .lt('due_date', new Date().toISOString().split('T')[0])
            .not('status', 'in', '(completed,cancelled)')
    ]);
    const statistics = {
        total: totalTasks || 0,
        completed: completedTasks || 0,
        in_progress: inProgressTasks || 0,
        overdue: overdueTasks || 0,
        completion_rate: totalTasks ? ((completedTasks || 0) / totalTasks) * 100 : 0
    };
    res.json({
        success: true,
        data: statistics
    });
});
//# sourceMappingURL=tasks.js.map