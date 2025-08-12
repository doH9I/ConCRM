import { Response } from 'express';
import { dbService, supabase } from '../utils/supabase';
import { AuthenticatedRequest, Task, TaskFilters, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo, logError } from '../middleware/logger';

// Получить все задачи с фильтрацией и пагинацией
export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    project_id,
    stage_id,
    status,
    priority,
    assigned_to,
    due_date_from,
    due_date_to,
    sort = 'created_at',
    order = 'desc'
  } = req.query as TaskFilters;

  const filters: Record<string, any> = {};
  
  if (project_id) filters.project_id = project_id;
  if (stage_id) filters.stage_id = stage_id;
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (assigned_to) filters.assigned_to = assigned_to;
  if (due_date_from) filters.due_date_from = due_date_from;
  if (due_date_to) filters.due_date_to = due_date_to;

  const result = await dbService.getPaginated<Task>(
    'tasks',
    parseInt(page),
    parseInt(limit),
    filters,
    { column: sort, ascending: order === 'asc' }
  );

  res.json({
    success: true,
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  } as PaginatedResponse<Task>);
});

// Получить задачу по ID
export const getTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const task = await dbService.getById<Task>('tasks', id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    success: true,
    data: task
  } as ApiResponse<Task>);
});

// Создать новую задачу
export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const taskData = {
    ...req.body,
    created_by: req.user.id,
    actual_hours: 0
  };

  const task = await dbService.create<Task>('tasks', taskData);

  logInfo('Task created', { taskId: task.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  } as ApiResponse<Task>);
});

// Обновить задачу
export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  // Если задача завершается, устанавливаем время завершения
  if (req.body.status === 'completed' && !req.body.completed_at) {
    req.body.completed_at = new Date().toISOString();
  }
  
  const task = await dbService.update<Task>('tasks', id, req.body);

  logInfo('Task updated', { taskId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task
  } as ApiResponse<Task>);
});

// Удалить задачу
export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await dbService.delete('tasks', id);

  logInfo('Task deleted', { taskId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Task deleted successfully'
  } as ApiResponse);
});

// Получить задачи пользователя
export const getMyTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const {
    page = '1',
    limit = '10',
    status,
    priority,
    project_id,
    sort = 'due_date',
    order = 'asc'
  } = req.query as TaskFilters;

  const filters: Record<string, any> = {
    assigned_to: req.user.id
  };
  
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (project_id) filters.project_id = project_id;

  const result = await dbService.getPaginated<Task>(
    'tasks',
    parseInt(page),
    parseInt(limit),
    filters,
    { column: sort, ascending: order === 'asc' }
  );

  res.json({
    success: true,
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  } as PaginatedResponse<Task>);
});

// Получить просроченные задачи
export const getOverdueTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    project_id,
    assigned_to
  } = req.query;

  let query = supabase.from('tasks')
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
    throw new AppError(`Failed to fetch overdue tasks: ${error.message}`, 400);
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
  } as PaginatedResponse<Task>);
});

// Обновить статус задачи
export const updateTaskStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  const updateData: any = { status };
  
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else if (status === 'in_progress' && !updateData.start_date) {
    updateData.start_date = new Date().toISOString().split('T')[0];
  }

  const task = await dbService.update<Task>('tasks', id, updateData);

  logInfo('Task status updated', { taskId: id, status, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Task status updated successfully',
    data: task
  } as ApiResponse<Task>);
});

// Добавить время к задаче
export const addTimeToTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { hours } = req.body;

  if (!hours || hours <= 0) {
    throw new AppError('Valid hours amount is required', 400);
  }

  // Получаем текущую задачу
  const currentTask = await dbService.getById<Task>('tasks', id);
  if (!currentTask) {
    throw new AppError('Task not found', 404);
  }

  const newActualHours = (currentTask.actual_hours || 0) + hours;
  
  const task = await dbService.update<Task>('tasks', id, {
    actual_hours: newActualHours
  });

  logInfo('Time added to task', { taskId: id, hours, totalHours: newActualHours, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Time added to task successfully',
    data: task
  } as ApiResponse<Task>);
});

// Получить статистику задач
export const getTasksStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { project_id } = req.query;

  let baseQuery = supabase.from('tasks');
  
  if (project_id) {
    baseQuery = baseQuery.eq('project_id', project_id);
  }

  const [
    { count: totalTasks },
    { count: completedTasks },
    { count: inProgressTasks },
    { count: overdueTasks }
  ] = await Promise.all([
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('tasks').select('*', { count: 'exact', head: true })
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
  } as ApiResponse<any>);
});