"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalaryReport = exports.getEmployeeStats = exports.approveTimesheet = exports.deleteTimeEntry = exports.updateTimeEntry = exports.addTimeEntry = exports.getTimeTracking = exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployee = exports.getEmployees = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
exports.getEmployees = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', department, position, is_active = 'true', search, sort = 'last_name', order = 'asc' } = req.query;
    const filters = {};
    if (department)
        filters.department = department;
    if (position)
        filters.position = position;
    if (is_active !== 'all')
        filters.is_active = is_active === 'true';
    if (search)
        filters.search = search;
    const result = await supabase_1.dbService.getPaginated('employees', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.getEmployee = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const employee = await supabase_1.dbService.getById('employees', id);
    if (!employee) {
        throw new errorHandler_1.AppError('Employee not found', 404);
    }
    res.json({
        success: true,
        data: employee
    });
});
exports.createEmployee = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    if (!req.body.employee_number) {
        const { count } = await supabase_1.supabase
            .from('employees')
            .select('*', { count: 'exact', head: true });
        req.body.employee_number = `EMP${String((count || 0) + 1).padStart(4, '0')}`;
    }
    const employee = await supabase_1.dbService.create('employees', req.body);
    (0, logger_1.logInfo)('Employee created', { employeeId: employee.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee
    });
});
exports.updateEmployee = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const employee = await supabase_1.dbService.update('employees', id, req.body);
    (0, logger_1.logInfo)('Employee updated', { employeeId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee
    });
});
exports.deleteEmployee = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await supabase_1.dbService.update('employees', id, { is_active: false });
    (0, logger_1.logInfo)('Employee deactivated', { employeeId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Employee deactivated successfully'
    });
});
exports.getTimeTracking = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', employee_id, project_id, date_from, date_to, sort = 'date', order = 'desc' } = req.query;
    const filters = {};
    if (employee_id)
        filters.employee_id = employee_id;
    if (project_id)
        filters.project_id = project_id;
    if (date_from)
        filters.date_from = date_from;
    if (date_to)
        filters.date_to = date_to;
    const result = await supabase_1.dbService.getPaginated('time_tracking', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.addTimeEntry = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const timeEntry = await supabase_1.dbService.create('time_tracking', req.body);
    (0, logger_1.logInfo)('Time entry added', { timeEntryId: timeEntry.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Time entry added successfully',
        data: timeEntry
    });
});
exports.updateTimeEntry = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const timeEntry = await supabase_1.dbService.update('time_tracking', id, req.body);
    (0, logger_1.logInfo)('Time entry updated', { timeEntryId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Time entry updated successfully',
        data: timeEntry
    });
});
exports.deleteTimeEntry = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await supabase_1.dbService.delete('time_tracking', id);
    (0, logger_1.logInfo)('Time entry deleted', { timeEntryId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Time entry deleted successfully'
    });
});
exports.approveTimesheet = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { employee_id, date_from, date_to } = req.body;
    const { data: timeEntries, error } = await supabase_1.supabase
        .from('time_tracking')
        .select('*')
        .eq('employee_id', employee_id)
        .gte('date', date_from)
        .lte('date', date_to)
        .is('approved_by', null);
    if (error) {
        throw new errorHandler_1.AppError(`Failed to fetch time entries: ${error.message}`, 400);
    }
    if (!timeEntries || timeEntries.length === 0) {
        throw new errorHandler_1.AppError('No time entries found for approval', 404);
    }
    const { error: updateError } = await supabase_1.supabase
        .from('time_tracking')
        .update({
        approved_by: req.user.id,
        approved_at: new Date().toISOString()
    })
        .eq('employee_id', employee_id)
        .gte('date', date_from)
        .lte('date', date_to)
        .is('approved_by', null);
    if (updateError) {
        throw new errorHandler_1.AppError(`Failed to approve timesheet: ${updateError.message}`, 400);
    }
    (0, logger_1.logInfo)('Timesheet approved', {
        employeeId: employee_id,
        dateFrom: date_from,
        dateTo: date_to,
        approvedBy: req.user.id
    });
    res.json({
        success: true,
        message: 'Timesheet approved successfully',
        data: { approved_entries: timeEntries.length }
    });
});
exports.getEmployeeStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { employee_id, date_from, date_to } = req.query;
    let query = supabase_1.supabase.from('time_tracking').select('*');
    if (employee_id)
        query = query.eq('employee_id', employee_id);
    if (date_from)
        query = query.gte('date', date_from);
    if (date_to)
        query = query.lte('date', date_to);
    const { data: timeEntries } = await query;
    const stats = {
        total_hours: 0,
        overtime_hours: 0,
        working_days: 0,
        projects_worked: new Set(),
        average_hours_per_day: 0
    };
    if (timeEntries) {
        stats.total_hours = timeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
        stats.overtime_hours = timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
        stats.working_days = new Set(timeEntries.map(entry => entry.date)).size;
        stats.projects_worked = new Set(timeEntries.map(entry => entry.project_id));
        stats.average_hours_per_day = stats.working_days > 0 ? stats.total_hours / stats.working_days : 0;
    }
    res.json({
        success: true,
        data: {
            ...stats,
            projects_worked: stats.projects_worked.size
        }
    });
});
exports.getSalaryReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { employee_id, month, year } = req.query;
    if (!employee_id || !month || !year) {
        throw new errorHandler_1.AppError('Employee ID, month, and year are required', 400);
    }
    const employee = await supabase_1.dbService.getById('employees', employee_id);
    if (!employee) {
        throw new errorHandler_1.AppError('Employee not found', 404);
    }
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0];
    const { data: timeEntries } = await supabase_1.supabase
        .from('time_tracking')
        .select('*')
        .eq('employee_id', employee_id)
        .gte('date', startDate)
        .lte('date', endDate);
    const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
    const overtimeHours = timeEntries?.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0) || 0;
    const regularHours = totalHours - overtimeHours;
    const baseSalary = employee.salary || 0;
    const hourlyRate = employee.hourly_rate || (baseSalary / 160);
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.5;
    const totalPay = regularPay + overtimePay;
    const report = {
        employee,
        period: { month, year, start_date: startDate, end_date: endDate },
        hours: {
            regular: regularHours,
            overtime: overtimeHours,
            total: totalHours
        },
        salary: {
            base: baseSalary,
            hourly_rate: hourlyRate,
            regular_pay: regularPay,
            overtime_pay: overtimePay,
            total_pay: totalPay
        },
        working_days: timeEntries?.length || 0
    };
    res.json({
        success: true,
        data: report
    });
});
//# sourceMappingURL=employees.js.map