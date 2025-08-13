import { Response } from 'express';
import { dbService, supabase } from '../utils/supabase';
import { AuthenticatedRequest, KsReport, KsItem, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo } from '../middleware/logger';

// Получить все КС отчеты
export const getKsReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    project_id,
    type,
    status,
    search,
    sort = 'created_at',
    order = 'desc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (project_id) filters.project_id = project_id;
  if (type) filters.type = type;
  if (status) filters.status = status;
  if (search) filters.search = search;

  const result = await dbService.getPaginated<KsReport>(
    'ks_reports',
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
  } as PaginatedResponse<KsReport>);
});

// Получить КС отчет по ID
export const getKsReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const { data: ksReport, error } = await supabase
    .from('ks_reports')
    .select(`
      *,
      projects(name),
      ks_items(*),
      created_by_profile:profiles!ks_reports_created_by_fkey(full_name),
      approved_by_profile:profiles!ks_reports_approved_by_fkey(full_name)
    `)
    .eq('id', id)
    .single();

  if (error || !ksReport) {
    throw new AppError('KS Report not found', 404);
  }

  res.json({
    success: true,
    data: ksReport
  } as ApiResponse<any>);
});

// Создать новый КС отчет
export const createKsReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  // Генерируем номер КС если не указан
  if (!req.body.number) {
    const { count } = await supabase
      .from('ks_reports')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', req.body.project_id)
      .eq('type', req.body.type);
    
    const typePrefix = req.body.type.toUpperCase();
    req.body.number = `${typePrefix}-${String((count || 0) + 1).padStart(3, '0')}`;
  }

  const ksReportData = {
    ...req.body,
    created_by: req.user.id,
    status: 'draft',
    total_amount: 0,
    previous_amount: 0,
    current_amount: 0
  };

  const ksReport = await dbService.create<KsReport>('ks_reports', ksReportData);

  logInfo('KS Report created', { ksReportId: ksReport.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    data: ksReport
  } as ApiResponse<KsReport>);
});

// Обновить КС отчет
export const updateKsReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const ksReport = await dbService.update<KsReport>('ks_reports', id, req.body);

  logInfo('KS Report updated', { ksReportId: id, userId: req.user?.id });

  res.json({
    success: true,
    data: ksReport
  } as ApiResponse<KsReport>);
});

// Удалить КС отчет
export const deleteKsReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await dbService.delete('ks_reports', id);

  logInfo('KS Report deleted', { ksReportId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'KS Report deleted successfully'
  });
});

// Добавить позицию в КС
export const addKsItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const itemData = {
    ...req.body,
    ks_report_id: id
  };

  const item = await dbService.create<KsItem>('ks_items', itemData);

  // Пересчитываем суммы КС
  await recalculateKsTotals(id);

  logInfo('KS Item added', { ksReportId: id, itemId: item.id, userId: req.user?.id });

  res.status(201).json({
    success: true,
    data: item
  } as ApiResponse<KsItem>);
});

// Обновить позицию КС
export const updateKsItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id, itemId } = req.params;

  const item = await dbService.update<KsItem>('ks_items', itemId, req.body);

  // Пересчитываем суммы КС
  await recalculateKsTotals(id);

  logInfo('KS Item updated', { ksReportId: id, itemId, userId: req.user?.id });

  res.json({
    success: true,
    data: item
  } as ApiResponse<KsItem>);
});

// Удалить позицию КС
export const deleteKsItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id, itemId } = req.params;

  await dbService.delete('ks_items', itemId);

  // Пересчитываем суммы КС
  await recalculateKsTotals(id);

  logInfo('KS Item deleted', { ksReportId: id, itemId, userId: req.user?.id });

  res.json({
    success: true,
    message: 'KS Item deleted successfully'
  });
});

// Утвердить КС отчет
export const approveKsReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const ksReport = await dbService.update<KsReport>('ks_reports', id, {
    status: 'approved',
    approved_by: req.user.id,
    approved_at: new Date().toISOString()
  });

  logInfo('KS Report approved', { ksReportId: id, userId: req.user.id });

  res.json({
    success: true,
    data: ksReport
  } as ApiResponse<KsReport>);
});

// Экспорт КС в PDF
export const exportKsReportToPDF = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Заглушка для PDF экспорта - требует детальной реализации
  res.json({
    success: true,
    message: 'KS Report PDF export functionality coming soon',
    data: { ksReportId: id }
  });
});

// Генерация КС из сметы
export const generateKsFromEstimate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { estimateId } = req.params;
  const { type, period_start, period_end } = req.body;

  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  // Получаем смету с позициями
  const { data: estimate, error } = await supabase
    .from('estimates')
    .select(`
      *,
      estimate_items(*)
    `)
    .eq('id', estimateId)
    .single();

  if (error || !estimate) {
    throw new AppError('Estimate not found', 404);
  }

  // Создаем КС на основе сметы
  const ksReportData = {
    project_id: estimate.project_id,
    type,
    number: '', // Будет сгенерирован автоматически
    date: new Date().toISOString().split('T')[0],
    period_start,
    period_end,
    contractor_name: 'ООО "Строитель"', // Можно получить из настроек
    customer_name: 'Заказчик', // Можно получить из проекта
    contract_number: 'Договор №1',
    contract_date: new Date().toISOString().split('T')[0],
    created_by: req.user.id
  };

  const ksReport = await dbService.create<KsReport>('ks_reports', ksReportData);

  // Копируем позиции из сметы
  for (const estimateItem of estimate.estimate_items) {
    await dbService.create<KsItem>('ks_items', {
      ks_report_id: ksReport.id,
      estimate_item_id: estimateItem.id,
      order_number: estimateItem.order_number,
      name: estimateItem.name,
      unit: estimateItem.unit,
      total_quantity: estimateItem.quantity,
      previous_quantity: 0,
      current_quantity: estimateItem.quantity,
      unit_price: estimateItem.unit_price,
      total_amount: estimateItem.total_price,
      previous_amount: 0,
      current_amount: estimateItem.total_price
    });
  }

  // Пересчитываем суммы КС
  await recalculateKsTotals(ksReport.id);

  logInfo('KS Report generated from estimate', { 
    ksReportId: ksReport.id, 
    estimateId, 
    userId: req.user.id 
  });

  res.status(201).json({
    success: true,
    data: ksReport
  } as ApiResponse<KsReport>);
});

// Вспомогательная функция для пересчета сумм КС
async function recalculateKsTotals(ksReportId: string): Promise<void> {
  const { data: items } = await supabase
    .from('ks_items')
    .select('*')
    .eq('ks_report_id', ksReportId);

  if (!items) return;

  const totals = items.reduce((acc, item) => ({
    total_amount: acc.total_amount + Number(item.total_amount || 0),
    previous_amount: acc.previous_amount + Number(item.previous_amount || 0),
    current_amount: acc.current_amount + Number(item.current_amount || 0)
  }), { total_amount: 0, previous_amount: 0, current_amount: 0 });

  await dbService.update('ks_reports', ksReportId, totals);
}