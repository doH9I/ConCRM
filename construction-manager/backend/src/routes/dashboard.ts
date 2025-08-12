import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Получить статистику для дашборда
const getDashboardStats = asyncHandler(async (req: any, res: any) => {
  const userId = req.user.id;

  // Получаем статистику проектов
  const [
    { count: totalProjects },
    { count: activeProjects },
    { count: completedProjects }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed')
  ]);

  // Получаем статистику задач
  const [
    { count: totalTasks },
    { count: completedTasks },
    { count: myTasks },
    { count: overdueTasks }
  ] = await Promise.all([
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', userId),
    supabase.from('tasks').select('*', { count: 'exact', head: true })
      .lt('due_date', new Date().toISOString().split('T')[0])
      .not('status', 'in', '(completed,cancelled)')
  ]);

  // Получаем финансовую статистику
  const { data: financialData } = await supabase
    .from('financial_operations')
    .select('operation_type, amount')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const totalIncome = financialData?.filter(op => op.operation_type === 'income')
    .reduce((sum, op) => sum + Number(op.amount), 0) || 0;
  
  const totalExpenses = financialData?.filter(op => op.operation_type === 'expense')
    .reduce((sum, op) => sum + Number(op.amount), 0) || 0;

  const stats = {
    projects: {
      total: totalProjects || 0,
      active: activeProjects || 0,
      completed: completedProjects || 0,
      overdue: 0 // TODO: Calculate overdue projects
    },
    tasks: {
      total: totalTasks || 0,
      completed: completedTasks || 0,
      overdue: overdueTasks || 0,
      my_tasks: myTasks || 0
    },
    finance: {
      total_budget: 0, // TODO: Calculate from projects
      total_spent: totalExpenses,
      monthly_income: [totalIncome], // TODO: Calculate by months
      monthly_expenses: [totalExpenses] // TODO: Calculate by months
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

router.get('/stats', getDashboardStats);

export default router;