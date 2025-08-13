import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Получаем статистику по проектам
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, budget, actual_cost, end_date');

  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
  
  // Вычисляем просроченные проекты
  const currentDate = new Date();
  const overdueProjects = projects?.filter(p => 
    p.end_date && new Date(p.end_date) < currentDate && p.status !== 'completed'
  ).length || 0;

  // Получаем статистику по задачам
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status, due_date, assigned_to');

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  const overdueTasks = tasks?.filter(t => 
    t.due_date && new Date(t.due_date) < currentDate && t.status !== 'completed'
  ).length || 0;
  const myTasks = tasks?.filter(t => t.assigned_to === req.user?.id).length || 0;

  // Получаем финансовую статистику
  const { data: financialOps } = await supabase
    .from('financial_operations')
    .select('amount, operation_type, document_date')
    .gte('document_date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
    .lte('document_date', new Date().toISOString().split('T')[0]);

  const totalIncome = financialOps?.filter(op => op.operation_type === 'income')
    .reduce((sum, op) => sum + Number(op.amount), 0) || 0;
  
  const totalExpenses = financialOps?.filter(op => op.operation_type === 'expense')
    .reduce((sum, op) => sum + Number(op.amount), 0) || 0;

  // Вычисляем общий бюджет проектов
  const totalBudget = projects?.reduce((sum, p) => sum + Number(p.budget || 0), 0) || 0;
  const totalSpent = projects?.reduce((sum, p) => sum + Number(p.actual_cost || 0), 0) || 0;

  // Вычисляем помесячную статистику
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

// Вспомогательная функция для вычисления помесячной статистики
function calculateMonthlyFinancialStats(operations: any[]) {
  const currentYear = new Date().getFullYear();
  const monthlyIncome = new Array(12).fill(0);
  const monthlyExpenses = new Array(12).fill(0);

  operations.forEach(op => {
    const opDate = new Date(op.document_date);
    if (opDate.getFullYear() === currentYear) {
      const month = opDate.getMonth();
      if (op.operation_type === 'income') {
        monthlyIncome[month] += Number(op.amount);
      } else {
        monthlyExpenses[month] += Number(op.amount);
      }
    }
  });

  return { monthlyIncome, monthlyExpenses };
}

router.get('/stats', getDashboardStats);

export default router;