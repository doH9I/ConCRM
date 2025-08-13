"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportFinancialData = exports.getExpenseCategories = exports.getProjectBudget = exports.getCashFlowReport = exports.getFinancialStats = exports.approveFinancialOperation = exports.deleteFinancialOperation = exports.updateFinancialOperation = exports.createFinancialOperation = exports.getFinancialOperation = exports.getFinancialOperations = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
exports.getFinancialOperations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', project_id, operation_type, category, subcategory, date_from, date_to, amount_from, amount_to, sort = 'document_date', order = 'desc' } = req.query;
    const filters = {};
    if (project_id)
        filters.project_id = project_id;
    if (operation_type)
        filters.operation_type = operation_type;
    if (category)
        filters.category = category;
    if (subcategory)
        filters.subcategory = subcategory;
    if (date_from)
        filters.date_from = date_from;
    if (date_to)
        filters.date_to = date_to;
    if (amount_from)
        filters.amount_from = amount_from;
    if (amount_to)
        filters.amount_to = amount_to;
    const result = await supabase_1.dbService.getPaginated('financial_operations', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
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
exports.getFinancialOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const operation = await supabase_1.dbService.getById('financial_operations', id);
    if (!operation) {
        throw new errorHandler_1.AppError('Financial operation not found', 404);
    }
    res.json({
        success: true,
        data: operation
    });
});
exports.createFinancialOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const operationData = {
        ...req.body,
        responsible_id: req.user.id,
        document_date: req.body.document_date || new Date().toISOString().split('T')[0]
    };
    const operation = await supabase_1.dbService.create('financial_operations', operationData);
    (0, logger_1.logInfo)('Financial operation created', { operationId: operation.id, userId: req.user.id });
    res.status(201).json({
        success: true,
        message: 'Financial operation created successfully',
        data: operation
    });
});
exports.updateFinancialOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const operation = await supabase_1.dbService.update('financial_operations', id, req.body);
    (0, logger_1.logInfo)('Financial operation updated', { operationId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Financial operation updated successfully',
        data: operation
    });
});
exports.deleteFinancialOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await supabase_1.dbService.delete('financial_operations', id);
    (0, logger_1.logInfo)('Financial operation deleted', { operationId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Financial operation deleted successfully'
    });
});
exports.approveFinancialOperation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { id } = req.params;
    const operation = await supabase_1.dbService.update('financial_operations', id, {
        approved_by: req.user.id,
        approved_at: new Date().toISOString()
    });
    (0, logger_1.logInfo)('Financial operation approved', { operationId: id, approvedBy: req.user.id });
    res.json({
        success: true,
        message: 'Financial operation approved successfully',
        data: operation
    });
});
exports.getFinancialStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id, date_from, date_to } = req.query;
    let query = supabase_1.supabase.from('financial_operations').select('*');
    if (project_id)
        query = query.eq('project_id', project_id);
    if (date_from)
        query = query.gte('document_date', date_from);
    if (date_to)
        query = query.lte('document_date', date_to);
    const { data: operations } = await query;
    const stats = {
        total_income: 0,
        total_expenses: 0,
        net_profit: 0,
        operations_count: {
            income: 0,
            expense: 0
        },
        categories: {},
        monthly_data: {}
    };
    if (operations) {
        operations.forEach(op => {
            const amount = Number(op.amount);
            if (op.operation_type === 'income') {
                stats.total_income += amount;
                stats.operations_count.income++;
            }
            else {
                stats.total_expenses += amount;
                stats.operations_count.expense++;
            }
            if (!stats.categories[op.category]) {
                stats.categories[op.category] = { income: 0, expense: 0 };
            }
            stats.categories[op.category][op.operation_type] += amount;
            const month = op.document_date?.substring(0, 7) || new Date().toISOString().substring(0, 7);
            if (!stats.monthly_data[month]) {
                stats.monthly_data[month] = { income: 0, expense: 0 };
            }
            stats.monthly_data[month][op.operation_type] += amount;
        });
        stats.net_profit = stats.total_income - stats.total_expenses;
    }
    res.json({
        success: true,
        data: stats
    });
});
exports.getCashFlowReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id, date_from, date_to, group_by = 'month' } = req.query;
    if (!date_from || !date_to) {
        throw new errorHandler_1.AppError('Date range is required', 400);
    }
    let query = supabase_1.supabase
        .from('financial_operations')
        .select('*')
        .gte('document_date', date_from)
        .lte('document_date', date_to)
        .order('document_date', { ascending: true });
    if (project_id) {
        query = query.eq('project_id', project_id);
    }
    const { data: operations } = await query;
    const report = {};
    let runningBalance = 0;
    operations?.forEach(op => {
        const amount = Number(op.amount);
        let period;
        if (group_by === 'day') {
            period = op.document_date || new Date().toISOString().split('T')[0];
        }
        else if (group_by === 'week') {
            const date = new Date(op.document_date || new Date());
            const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
            period = startOfWeek.toISOString().split('T')[0];
        }
        else {
            period = (op.document_date || new Date().toISOString()).substring(0, 7);
        }
        if (!report[period]) {
            report[period] = { income: 0, expense: 0, balance: 0 };
        }
        if (op.operation_type === 'income') {
            report[period].income += amount;
            runningBalance += amount;
        }
        else {
            report[period].expense += amount;
            runningBalance -= amount;
        }
        report[period].balance = runningBalance;
    });
    const reportArray = Object.entries(report).map(([period, data]) => ({
        period,
        ...data,
        net_flow: data.income - data.expense
    }));
    res.json({
        success: true,
        data: {
            report: reportArray,
            summary: {
                total_income: reportArray.reduce((sum, item) => sum + item.income, 0),
                total_expenses: reportArray.reduce((sum, item) => sum + item.expense, 0),
                final_balance: runningBalance
            }
        }
    });
});
exports.getProjectBudget = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id } = req.params;
    if (!project_id) {
        throw new errorHandler_1.AppError('Project ID is required', 400);
    }
    const project = await supabase_1.dbService.getById('projects', project_id);
    if (!project) {
        throw new errorHandler_1.AppError('Project not found', 404);
    }
    const { data: operations } = await supabase_1.supabase
        .from('financial_operations')
        .select('*')
        .eq('project_id', project_id);
    const totalIncome = operations?.filter(op => op.operation_type === 'income')
        .reduce((sum, op) => sum + Number(op.amount), 0) || 0;
    const totalExpenses = operations?.filter(op => op.operation_type === 'expense')
        .reduce((sum, op) => sum + Number(op.amount), 0) || 0;
    const plannedBudget = Number(project.budget) || 0;
    const actualCost = Number(project.actual_cost) || totalExpenses;
    const budgetVariance = plannedBudget - actualCost;
    const budgetUtilization = plannedBudget > 0 ? (actualCost / plannedBudget) * 100 : 0;
    const budget = {
        project_info: {
            id: project.id,
            name: project.name,
            status: project.status
        },
        budget: {
            planned: plannedBudget,
            actual_income: totalIncome,
            actual_expenses: actualCost,
            variance: budgetVariance,
            utilization_percent: budgetUtilization,
            remaining_budget: plannedBudget - actualCost,
            profit_margin: totalIncome - actualCost
        },
        operations_summary: {
            total_operations: operations?.length || 0,
            income_operations: operations?.filter(op => op.operation_type === 'income').length || 0,
            expense_operations: operations?.filter(op => op.operation_type === 'expense').length || 0
        }
    };
    res.json({
        success: true,
        data: budget
    });
});
exports.getExpenseCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { data: categories } = await supabase_1.supabase
        .from('financial_operations')
        .select('category, subcategory')
        .eq('operation_type', 'expense')
        .not('category', 'is', null);
    const categoriesMap = new Map();
    categories?.forEach(item => {
        if (!categoriesMap.has(item.category)) {
            categoriesMap.set(item.category, new Set());
        }
        if (item.subcategory) {
            categoriesMap.get(item.category)?.add(item.subcategory);
        }
    });
    const result = Array.from(categoriesMap.entries()).map(([category, subcategories]) => ({
        category,
        subcategories: Array.from(subcategories)
    }));
    res.json({
        success: true,
        data: result
    });
});
exports.exportFinancialData = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { project_id, date_from, date_to, format = 'json' } = req.query;
    let query = supabase_1.supabase.from('financial_operations').select(`
    *,
    projects:project_id(name)
  `);
    if (project_id)
        query = query.eq('project_id', project_id);
    if (date_from)
        query = query.gte('document_date', date_from);
    if (date_to)
        query = query.lte('document_date', date_to);
    const { data: operations } = await query;
    if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=financial_operations.csv');
        const csvData = operations?.map(op => `${op.id},${op.operation_type},${op.category},${op.amount},${op.document_date},${op.description || ''}`).join('\n');
        res.send(`ID,Type,Category,Amount,Date,Description\n${csvData}`);
    }
    else {
        res.json({
            success: true,
            data: operations,
            exported_at: new Date().toISOString(),
            total_records: operations?.length || 0
        });
    }
});
//# sourceMappingURL=financial.js.map