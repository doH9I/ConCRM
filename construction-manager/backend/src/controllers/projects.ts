import { Response } from 'express';
import { dbService } from '../utils/supabase';
import { AuthenticatedRequest, Project, ProjectFilters, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo, logError } from '../middleware/logger';

// Получить все проекты с фильтрацией и пагинацией
export const getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    status,
    manager_id,
    client_company_id,
    search,
    sort = 'created_at',
    order = 'desc'
  } = req.query as ProjectFilters;

  const filters: Record<string, any> = {};
  
  if (status) filters.status = status;
  if (manager_id) filters.manager_id = manager_id;
  if (client_company_id) filters.client_company_id = client_company_id;
  if (search) filters.search = search;

  const result = await dbService.getPaginated<Project>(
    'projects',
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
  } as PaginatedResponse<Project>);
});

// Получить проект по ID
export const getProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const project = await dbService.getById<Project>('projects', id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.json({
    success: true,
    data: project
  } as ApiResponse<Project>);
});

// Создать новый проект
export const createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const projectData = {
    ...req.body,
    manager_id: req.user.id,
    actual_cost: 0,
    progress_percent: 0
  };

  const project = await dbService.create<Project>('projects', projectData);

  logInfo('Project created', { projectId: project.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  } as ApiResponse<Project>);
});

// Обновить проект
export const updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  const project = await dbService.update<Project>('projects', id, req.body);

  logInfo('Project updated', { projectId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project
  } as ApiResponse<Project>);
});

// Удалить проект
export const deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await dbService.delete('projects', id);

  logInfo('Project deleted', { projectId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Project deleted successfully'
  } as ApiResponse);
});

// Получить статистику проекта
export const getProjectStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Получаем основную информацию о проекте
  const project = await dbService.getById<Project>('projects', id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Получаем статистику задач
  const tasks = await dbService.getBy<any>('tasks', { project_id: id });
  const completedTasks = tasks.filter((task: any) => task.status === 'completed');
  const overdueTasks = tasks.filter((task: any) => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

  // Получаем этапы проекта
  const stages = await dbService.getBy<any>('project_stages', { project_id: id });
  const completedStages = stages.filter((stage: any) => stage.status === 'completed');

  // Получаем финансовые операции
  const financialOps = await dbService.getBy<any>('financial_operations', { project_id: id });
  const totalIncome = financialOps
    .filter((op: any) => op.operation_type === 'income')
    .reduce((sum: number, op: any) => sum + Number(op.amount), 0);
  const totalExpenses = financialOps
    .filter((op: any) => op.operation_type === 'expense')
    .reduce((sum: number, op: any) => sum + Number(op.amount), 0);

  const statistics = {
    project: project,
    tasks: {
      total: tasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      completion_rate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
    },
    stages: {
      total: stages.length,
      completed: completedStages.length,
      completion_rate: stages.length > 0 ? (completedStages.length / stages.length) * 100 : 0
    },
    finance: {
      budget: Number(project.budget) || 0,
      actual_cost: Number(project.actual_cost) || 0,
      income: totalIncome,
      expenses: totalExpenses,
      profit: totalIncome - totalExpenses,
      budget_utilization: project.budget ? (Number(project.actual_cost) / Number(project.budget)) * 100 : 0
    }
  };

  res.json({
    success: true,
    data: statistics
  } as ApiResponse<any>);
});

// Получить участников проекта
export const getProjectParticipants = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Получаем задачи проекта с назначенными пользователями
  const tasks = await dbService.getBy<any>('tasks', { project_id: id });
  const assignedUsers = [...new Set(tasks.map((task: any) => task.assigned_to).filter(Boolean))];

  // Получаем этапы проекта с ответственными
  const stages = await dbService.getBy<any>('project_stages', { project_id: id });
  const responsibleUsers = [...new Set(stages.map((stage: any) => stage.responsible_id).filter(Boolean))];

  // Объединяем всех участников
  const allParticipants = [...new Set([...assignedUsers, ...responsibleUsers])];

  // Получаем информацию о пользователях
  const participants = [];
  for (const userId of allParticipants) {
    const user = await dbService.getById('profiles', userId);
    if (user) {
      participants.push(user);
    }
  }

  res.json({
    success: true,
    data: participants
  } as ApiResponse<any[]>);
});

// Обновить прогресс проекта
export const updateProjectProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { progress_percent } = req.body;

  if (progress_percent < 0 || progress_percent > 100) {
    throw new AppError('Progress must be between 0 and 100', 400);
  }

  const project = await dbService.update<Project>('projects', id, {
    progress_percent,
    ...(progress_percent === 100 && { status: 'completed', end_date: new Date().toISOString() })
  });

  logInfo('Project progress updated', { projectId: id, progress: progress_percent, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Project progress updated successfully',
    data: project
  } as ApiResponse<Project>);
});