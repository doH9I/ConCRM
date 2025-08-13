import { Response } from 'express';
import { supabase } from '../utils/supabase';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo } from '../middleware/logger';
import * as ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';

// Отчет по проектам
export const getProjectReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    start_date,
    end_date,
    status,
    manager_id,
    format = 'json'
  } = req.query;

  let query = supabase
    .from('projects')
    .select(`
      *,
      manager:profiles!projects_manager_id_fkey(full_name),
      tasks(id, status),
      financial_operations(amount, operation_type)
    `);

  if (start_date) {
    query = query.gte('start_date', start_date);
  }
  if (end_date) {
    query = query.lte('end_date', end_date);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (manager_id) {
    query = query.eq('manager_id', manager_id);
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new AppError('Failed to generate project report', 500);
  }

  // Обработка данных для отчета
  const reportData = projects.map(project => ({
    ...project,
    task_count: project.tasks?.length || 0,
    completed_tasks: project.tasks?.filter((task: any) => task.status === 'completed').length || 0,
    total_income: project.financial_operations?.filter((op: any) => op.operation_type === 'income')
      .reduce((sum: number, op: any) => sum + Number(op.amount), 0) || 0,
    total_expenses: project.financial_operations?.filter((op: any) => op.operation_type === 'expense')
      .reduce((sum: number, op: any) => sum + Number(op.amount), 0) || 0
  }));

  const summary = {
    total_projects: reportData.length,
    active_projects: reportData.filter(p => p.status === 'active').length,
    completed_projects: reportData.filter(p => p.status === 'completed').length,
    total_budget: reportData.reduce((sum, p) => sum + Number(p.budget || 0), 0),
    total_actual_cost: reportData.reduce((sum, p) => sum + Number(p.actual_cost || 0), 0)
  };

  res.json({
    success: true,
    data: {
      projects: reportData,
      summary,
      generated_at: new Date().toISOString()
    }
  } as ApiResponse<any>);
});

// Финансовый отчет
export const getFinancialReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    start_date,
    end_date,
    project_id,
    category,
    operation_type
  } = req.query;

  let query = supabase
    .from('financial_operations')
    .select(`
      *,
      projects(name)
    `);

  if (start_date) {
    query = query.gte('document_date', start_date);
  }
  if (end_date) {
    query = query.lte('document_date', end_date);
  }
  if (project_id) {
    query = query.eq('project_id', project_id);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (operation_type) {
    query = query.eq('operation_type', operation_type);
  }

  const { data: operations, error } = await query;

  if (error) {
    throw new AppError('Failed to generate financial report', 500);
  }

  const summary = {
    total_income: operations.filter(op => op.operation_type === 'income')
      .reduce((sum, op) => sum + Number(op.amount), 0),
    total_expenses: operations.filter(op => op.operation_type === 'expense')
      .reduce((sum, op) => sum + Number(op.amount), 0),
    net_profit: 0,
    by_category: operations.reduce((acc: any, op) => {
      if (!acc[op.category]) {
        acc[op.category] = { income: 0, expense: 0 };
      }
      acc[op.category][op.operation_type] += Number(op.amount);
      return acc;
    }, {})
  };

  summary.net_profit = summary.total_income - summary.total_expenses;

  res.json({
    success: true,
    data: {
      operations,
      summary,
      generated_at: new Date().toISOString()
    }
  } as ApiResponse<any>);
});

// Отчет по учету времени
export const getTimeTrackingReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    start_date,
    end_date,
    employee_id,
    project_id
  } = req.query;

  let query = supabase
    .from('time_tracking')
    .select(`
      *,
      employees(first_name, last_name, position),
      projects(name)
    `);

  if (start_date) {
    query = query.gte('date', start_date);
  }
  if (end_date) {
    query = query.lte('date', end_date);
  }
  if (employee_id) {
    query = query.eq('employee_id', employee_id);
  }
  if (project_id) {
    query = query.eq('project_id', project_id);
  }

  const { data: timeEntries, error } = await query;

  if (error) {
    throw new AppError('Failed to generate time tracking report', 500);
  }

  const summary = {
    total_hours: timeEntries.reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0),
    overtime_hours: timeEntries.reduce((sum, entry) => sum + Number(entry.overtime_hours || 0), 0),
    by_employee: timeEntries.reduce((acc: any, entry) => {
      const key = entry.employee_id;
      if (!acc[key]) {
        acc[key] = {
          employee_name: `${entry.employees?.first_name} ${entry.employees?.last_name}`,
          total_hours: 0,
          overtime_hours: 0
        };
      }
      acc[key].total_hours += Number(entry.total_hours || 0);
      acc[key].overtime_hours += Number(entry.overtime_hours || 0);
      return acc;
    }, {})
  };

  res.json({
    success: true,
    data: {
      time_entries: timeEntries,
      summary,
      generated_at: new Date().toISOString()
    }
  } as ApiResponse<any>);
});

// Отчет по материалам
export const getMaterialReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    start_date,
    end_date,
    material_id,
    project_id,
    operation_type
  } = req.query;

  let query = supabase
    .from('warehouse_operations')
    .select(`
      *,
      materials(name, unit),
      projects(name)
    `);

  if (start_date) {
    query = query.gte('document_date', start_date);
  }
  if (end_date) {
    query = query.lte('document_date', end_date);
  }
  if (material_id) {
    query = query.eq('material_id', material_id);
  }
  if (project_id) {
    query = query.eq('project_id', project_id);
  }
  if (operation_type) {
    query = query.eq('operation_type', operation_type);
  }

  const { data: operations, error } = await query;

  if (error) {
    throw new AppError('Failed to generate material report', 500);
  }

  // Получаем текущие остатки
  const { data: stocks } = await supabase
    .from('material_stock')
    .select(`
      *,
      materials(name, unit)
    `);

  const summary = {
    total_operations: operations.length,
    total_value: operations.reduce((sum, op) => sum + Number(op.total_price || 0), 0),
    by_material: operations.reduce((acc: any, op) => {
      const key = op.material_id;
      if (!acc[key]) {
        acc[key] = {
          material_name: op.materials?.name,
          receipts: 0,
          consumptions: 0,
          total_value: 0
        };
      }
      if (op.operation_type === 'receipt') {
        acc[key].receipts += Number(op.quantity);
      } else if (op.operation_type === 'consumption') {
        acc[key].consumptions += Number(op.quantity);
      }
      acc[key].total_value += Number(op.total_price || 0);
      return acc;
    }, {}),
    current_stocks: stocks || []
  };

  res.json({
    success: true,
    data: {
      operations,
      summary,
      generated_at: new Date().toISOString()
    }
  } as ApiResponse<any>);
});

// Отчет по производительности
export const getProductivityReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    start_date,
    end_date,
    employee_id,
    project_id
  } = req.query;

  // Получаем задачи с информацией о времени выполнения
  let taskQuery = supabase
    .from('tasks')
    .select(`
      *,
      projects(name),
      assigned_profile:profiles!tasks_assigned_to_fkey(full_name),
      time_tracking(total_hours)
    `);

  if (start_date) {
    taskQuery = taskQuery.gte('created_at', start_date);
  }
  if (end_date) {
    taskQuery = taskQuery.lte('created_at', end_date);
  }
  if (employee_id) {
    taskQuery = taskQuery.eq('assigned_to', employee_id);
  }
  if (project_id) {
    taskQuery = taskQuery.eq('project_id', project_id);
  }

  const { data: tasks, error } = await taskQuery;

  if (error) {
    throw new AppError('Failed to generate productivity report', 500);
  }

  const summary = {
    total_tasks: tasks.length,
    completed_tasks: tasks.filter(t => t.status === 'completed').length,
    in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
    overdue_tasks: tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length,
    completion_rate: tasks.length > 0 ? 
      (tasks.filter(t => t.status === 'completed').length / tasks.length * 100).toFixed(2) : 0,
    average_completion_time: calculateAverageCompletionTime(tasks),
    by_employee: calculateEmployeeProductivity(tasks)
  };

  res.json({
    success: true,
    data: {
      tasks,
      summary,
      generated_at: new Date().toISOString()
    }
  } as ApiResponse<any>);
});

// Кастомный отчет
export const getCustomReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { query: customQuery, parameters } = req.body;

  if (!customQuery) {
    throw new AppError('Custom query is required', 400);
  }

  try {
    const { data, error } = await supabase.rpc('execute_custom_report', {
      query: customQuery,
      params: parameters || {}
    });

    if (error) {
      throw new AppError(`Custom report error: ${error.message}`, 400);
    }

    res.json({
      success: true,
      data: {
        result: data,
        generated_at: new Date().toISOString()
      }
    } as ApiResponse<any>);
  } catch (error: any) {
    throw new AppError(`Failed to execute custom report: ${error.message}`, 500);
  }
});

// Экспорт отчета в PDF
export const exportReportToPDF = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Заглушка для PDF экспорта - нужна более детальная реализация
  res.json({
    success: true,
    message: 'PDF export functionality coming soon'
  });
});

// Экспорт отчета в Excel
export const exportReportToExcel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { report_type, data } = req.body;

  if (!data) {
    throw new AppError('Report data is required', 400);
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(report_type || 'Report');
    
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      data.forEach(row => {
        worksheet.addRow(headers.map(header => row[header]));
      });
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${report_type || 'report'}.xlsx`);
    
    res.send(buffer);
  } catch (error: any) {
    throw new AppError(`Failed to generate Excel report: ${error.message}`, 500);
  }
});

// Вспомогательные функции
function calculateAverageCompletionTime(tasks: any[]): number {
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.completed_at);
  
  if (completedTasks.length === 0) return 0;
  
  const totalDays = completedTasks.reduce((sum, task) => {
    const start = new Date(task.created_at);
    const end = new Date(task.completed_at);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return totalDays / completedTasks.length;
}

function calculateEmployeeProductivity(tasks: any[]): any {
  return tasks.reduce((acc: any, task) => {
    if (!task.assigned_to) return acc;
    
    const key = task.assigned_to;
    if (!acc[key]) {
      acc[key] = {
        employee_name: task.assigned_profile?.full_name || 'Unknown',
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        overdue_tasks: 0
      };
    }
    
    acc[key].total_tasks++;
    
    if (task.status === 'completed') {
      acc[key].completed_tasks++;
    } else if (task.status === 'in_progress') {
      acc[key].in_progress_tasks++;
    }
    
    if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed') {
      acc[key].overdue_tasks++;
    }
    
    return acc;
  }, {});
}