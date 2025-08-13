import { Response } from 'express';
import { dbService, supabase } from '../utils/supabase';
import { AuthenticatedRequest, Defect, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo } from '../middleware/logger';

// Получить все дефектовки
export const getDefects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    project_id,
    status,
    severity,
    assigned_to,
    search,
    sort = 'created_at',
    order = 'desc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (project_id) filters.project_id = project_id;
  if (status) filters.status = status;
  if (severity) filters.severity = severity;
  if (assigned_to) filters.assigned_to = assigned_to;
  if (search) filters.search = search;

  const result = await dbService.getPaginated<Defect>(
    'defects',
    parseInt(page as string),
    parseInt(limit as string),
    filters,
    { column: sort as string, ascending: order === 'asc' }
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
  } as PaginatedResponse<Defect>);
});

// Получить дефектовку по ID
export const getDefect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { data: defect, error } = await supabase
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
    throw new AppError('Defect not found', 404);
  }

  res.json({
    success: true,
    data: defect
  } as ApiResponse<any>);
});

// Создать новую дефектовку
export const createDefect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const defectData = {
    ...req.body,
    found_by: req.user.id,
    status: 'open'
  };

  const defect = await dbService.create<Defect>('defects', defectData);

  logInfo('Defect created', { defectId: defect.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    data: defect
  } as ApiResponse<Defect>);
});

// Обновить дефектовку
export const updateDefect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const defect = await dbService.update<Defect>('defects', id, req.body);

  logInfo('Defect updated', { defectId: id, userId: req.user?.id });

  res.json({
    success: true,
    data: defect
  } as ApiResponse<Defect>);
});

// Удалить дефектовку
export const deleteDefect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await dbService.delete('defects', id);

  logInfo('Defect deleted', { defectId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Defect deleted successfully'
  });
});

// Назначить дефектовку исполнителю
export const assignDefect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  if (!assigned_to) {
    throw new AppError('assigned_to is required', 400);
  }

  const defect = await dbService.update<Defect>('defects', id, {
    assigned_to,
    status: 'in_progress'
  });

  logInfo('Defect assigned', { defectId: id, assignedTo: assigned_to, userId: req.user?.id });

  res.json({
    success: true,
    data: defect
  } as ApiResponse<Defect>);
});

// Закрыть дефектовку
export const resolveDefect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { resolution_notes } = req.body;

  const defect = await dbService.update<Defect>('defects', id, {
    status: 'resolved',
    resolution_notes,
    resolved_at: new Date().toISOString()
  });

  logInfo('Defect resolved', { defectId: id, userId: req.user?.id });

  res.json({
    success: true,
    data: defect
  } as ApiResponse<Defect>);
});

// Переотрыть дефектовку
export const reopenDefect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const defect = await dbService.update<Defect>('defects', id, {
    status: 'open',
    resolved_at: null,
    resolution_notes: null
  });

  logInfo('Defect reopened', { defectId: id, userId: req.user?.id });

  res.json({
    success: true,
    data: defect
  } as ApiResponse<Defect>);
});

// Получить статистику по дефектовкам
export const getDefectStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { project_id } = req.query;

  let query = supabase.from('defects').select('status, severity');
  
  if (project_id) {
    query = query.eq('project_id', project_id);
  }

  const { data: defects, error } = await query;

  if (error) {
    throw new AppError('Failed to fetch defect statistics', 500);
  }

  const stats = {
    total: defects.length,
    by_status: defects.reduce((acc: any, defect) => {
      acc[defect.status] = (acc[defect.status] || 0) + 1;
      return acc;
    }, {}),
    by_severity: defects.reduce((acc: any, defect) => {
      acc[defect.severity] = (acc[defect.severity] || 0) + 1;
      return acc;
    }, {})
  };

  res.json({
    success: true,
    data: stats
  });
});

// Загрузить фотографии дефектовки
export const uploadDefectPhotos = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { photo_urls } = req.body;

  if (!photo_urls || !Array.isArray(photo_urls)) {
    throw new AppError('photo_urls array is required', 400);
  }

  // Получаем текущие фото
  const { data: currentDefect } = await supabase
    .from('defects')
    .select('photo_urls')
    .eq('id', id)
    .single();

  const existingPhotos = currentDefect?.photo_urls || [];
  const updatedPhotos = [...existingPhotos, ...photo_urls];

  const defect = await dbService.update<Defect>('defects', id, {
    photo_urls: updatedPhotos
  });

  logInfo('Defect photos uploaded', { defectId: id, photoCount: photo_urls.length, userId: req.user?.id });

  res.json({
    success: true,
    data: defect
  } as ApiResponse<Defect>);
});