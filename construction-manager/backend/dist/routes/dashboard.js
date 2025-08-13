"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const getDashboardStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { data: projects } = await supabase_1.supabase
        .from('projects')
        .select('id, status, budget, actual_cost, end_date');
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
    const currentDate = new Date();
    const overdueProjects = projects?.filter(p => p.end_date && new Date(p.end_date) < currentDate && p.status !== 'completed').length || 0;
    const { data: tasks } = await supabase_1.supabase
        .from('tasks')
        .select('id, status, due_date, assigned_to');
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
    const overdueTasks = tasks?.filter(t => t.due_date && new Date(t.due_date) < currentDate && t.status !== 'completed').length || 0;
    const myTasks = tasks?.filter(t => t.assigned_to === req.user?.id).length || 0;
    const { data: financialOps } = await supabase_1.supabase
        .from('financial_operations')
        .select('amount, operation_type, document_date')
        .gte('document_date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
        .lte('document_date', new Date().toISOString().split('T')[0]);
    const totalIncome = financialOps?.filter(op => op.operation_type === 'income')
        .reduce((sum, op) => sum + Number(op.amount), 0) || 0;
    const totalExpenses = financialOps?.filter(op => op.operation_type === 'expense')
        .reduce((sum, op) => sum + Number(op.amount), 0) || 0;
    const totalBudget = projects?.reduce((sum, p) => sum + Number(p.budget || 0), 0) || 0;
    const totalSpent = projects?.reduce((sum, p) => sum + Number(p.actual_cost || 0), 0) || 0;
    const monthlyStats = calculateMonthlyFinancialStats(financialOps || []);
    const stats = {
        projects: {
            total: totalProjects,
            active: activeProjects,
            completed: completedProjects,
            overdue: overdueProjects
        },
        tasks: {
            total: totalTasks,
            completed: completedTasks,
            overdue: overdueTasks,
            my_tasks: myTasks
        },
        finance: {
            total_budget: totalBudget,
            total_spent: totalSpent,
            total_income: totalIncome,
            total_expenses: totalExpenses,
            net_profit: totalIncome - totalExpenses,
            monthly_income: monthlyStats.monthlyIncome,
            monthly_expenses: monthlyStats.monthlyExpenses
        }
    };
    res.json({
        success: true,
        data: stats
    });
});
function calculateMonthlyFinancialStats(operations) {
    const currentYear = new Date().getFullYear();
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);
    operations.forEach(op => {
        const opDate = new Date(op.document_date);
        if (opDate.getFullYear() === currentYear) {
            const month = opDate.getMonth();
            if (op.operation_type === 'income') {
                monthlyIncome[month] += Number(op.amount);
            }
            else {
                monthlyExpenses[month] += Number(op.amount);
            }
        }
    });
    return { monthlyIncome, monthlyExpenses };
}
router.get('/stats', getDashboardStats);
exports.default = router;
//# sourceMappingURL=dashboard.js.map