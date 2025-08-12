import { Response } from 'express';
import { dbService, supabase } from '../utils/supabase';
import { AuthenticatedRequest, Estimate, EstimateItem, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo } from '../middleware/logger';
import * as XLSX from 'xlsx';

// Получить все сметы
export const getEstimates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    project_id,
    status,
    search,
    sort = 'created_at',
    order = 'desc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (project_id) filters.project_id = project_id;
  if (status) filters.status = status;
  if (search) filters.search = search;

  const result = await dbService.getPaginated<Estimate>(
    'estimates',
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
  } as PaginatedResponse<Estimate>);
});

// Получить смету по ID с позициями
export const getEstimate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Получаем смету с позициями
  const { data: estimate, error } = await supabase
    .from('estimates')
    .select(`
      *,
      projects(name),
      estimate_items(*)
    `)
    .eq('id', id)
    .single();

  if (error || !estimate) {
    throw new AppError('Estimate not found', 404);
  }

  res.json({
    success: true,
    data: estimate
  } as ApiResponse<any>);
});

// Создать новую смету
export const createEstimate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  // Генерируем номер сметы если не указан
  if (!req.body.number) {
    const { count } = await supabase
      .from('estimates')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', req.body.project_id);
    
    req.body.number = `EST-${String((count || 0) + 1).padStart(3, '0')}`;
  }

  const estimateData = {
    ...req.body,
    created_by: req.user.id,
    total_amount: 0,
    labor_cost: 0,
    material_cost: 0,
    equipment_cost: 0
  };

  const estimate = await dbService.create<Estimate>('estimates', estimateData);

  logInfo('Estimate created', { estimateId: estimate.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Estimate created successfully',
    data: estimate
  } as ApiResponse<Estimate>);
});

// Обновить смету
export const updateEstimate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const estimate = await dbService.update<Estimate>('estimates', id, req.body);

  logInfo('Estimate updated', { estimateId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Estimate updated successfully',
    data: estimate
  } as ApiResponse<Estimate>);
});

// Удалить смету
export const deleteEstimate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Проверяем, есть ли связанные КС отчеты
  const { count } = await supabase
    .from('ks_items')
    .select('*', { count: 'exact', head: true })
    .not('estimate_item_id', 'is', null)
    .in('estimate_item_id', 
      supabase.from('estimate_items').select('id').eq('estimate_id', id)
    );

  if (count && count > 0) {
    throw new AppError('Cannot delete estimate with linked KS reports', 400);
  }

  await dbService.delete('estimates', id);

  logInfo('Estimate deleted', { estimateId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Estimate deleted successfully'
  } as ApiResponse);
});

// Утвердить смету
export const approveEstimate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;

  const estimate = await dbService.update<Estimate>('estimates', id, {
    status: 'approved',
    approved_by: req.user.id,
    approved_at: new Date().toISOString()
  });

  logInfo('Estimate approved', { estimateId: id, approvedBy: req.user.id });

  res.json({
    success: true,
    message: 'Estimate approved successfully',
    data: estimate
  } as ApiResponse<Estimate>);
});

// Получить позиции сметы
export const getEstimateItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { estimate_id } = req.params;
  const {
    page = '1',
    limit = '50',
    category,
    sort = 'order_number',
    order = 'asc'
  } = req.query;

  const filters: Record<string, any> = {
    estimate_id
  };
  
  if (category) filters.category = category;

  const result = await dbService.getPaginated<EstimateItem>(
    'estimate_items',
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
  } as PaginatedResponse<EstimateItem>);
});

// Добавить позицию в смету
export const addEstimateItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { estimate_id } = req.params;

  // Получаем следующий номер позиции если не указан
  if (!req.body.order_number) {
    const { count } = await supabase
      .from('estimate_items')
      .select('*', { count: 'exact', head: true })
      .eq('estimate_id', estimate_id);
    
    req.body.order_number = (count || 0) + 1;
  }

  const itemData = {
    ...req.body,
    estimate_id,
    total_price: req.body.quantity * req.body.unit_price
  };

  const item = await dbService.create<EstimateItem>('estimate_items', itemData);

  // Пересчитываем общую сумму сметы
  await recalculateEstimateTotal(estimate_id);

  logInfo('Estimate item added', { estimateId: estimate_id, itemId: item.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Estimate item added successfully',
    data: item
  } as ApiResponse<EstimateItem>);
});

// Обновить позицию сметы
export const updateEstimateItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Пересчитываем общую стоимость если изменились количество или цена
  if (req.body.quantity || req.body.unit_price) {
    const currentItem = await dbService.getById<EstimateItem>('estimate_items', id);
    if (currentItem) {
      const quantity = req.body.quantity || currentItem.quantity;
      const unitPrice = req.body.unit_price || currentItem.unit_price;
      req.body.total_price = quantity * unitPrice;
    }
  }

  const item = await dbService.update<EstimateItem>('estimate_items', id, req.body);

  // Пересчитываем общую сумму сметы
  await recalculateEstimateTotal(item.estimate_id);

  logInfo('Estimate item updated', { itemId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Estimate item updated successfully',
    data: item
  } as ApiResponse<EstimateItem>);
});

// Удалить позицию сметы
export const deleteEstimateItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Получаем информацию о позиции для пересчета сметы
  const item = await dbService.getById<EstimateItem>('estimate_items', id);
  if (!item) {
    throw new AppError('Estimate item not found', 404);
  }

  await dbService.delete('estimate_items', id);

  // Пересчитываем общую сумму сметы
  await recalculateEstimateTotal(item.estimate_id);

  logInfo('Estimate item deleted', { itemId: id, estimateId: item.estimate_id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Estimate item deleted successfully'
  } as ApiResponse);
});

// Импорт сметы из Excel
export const importEstimateFromExcel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { estimate_id } = req.params;
  
  if (!req.file) {
    throw new AppError('Excel file is required', 400);
  }

  try {
    // Читаем Excel файл
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const items: any[] = [];
    
    // Предполагаем, что первая строка - заголовки
    // Формат: Номер, Наименование, Единица, Количество, Цена, Категория
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      if (row.length >= 5 && row[1] && row[2] && row[3] && row[4]) {
        items.push({
          estimate_id,
          order_number: row[0] || i,
          name: row[1],
          unit: row[2],
          quantity: Number(row[3]) || 0,
          unit_price: Number(row[4]) || 0,
          total_price: (Number(row[3]) || 0) * (Number(row[4]) || 0),
          category: row[5] || 'Общие работы',
          labor_cost: Number(row[6]) || 0,
          material_cost: Number(row[7]) || 0,
          equipment_cost: Number(row[8]) || 0,
          notes: row[9] || ''
        });
      }
    }

    if (items.length === 0) {
      throw new AppError('No valid items found in Excel file', 400);
    }

    // Удаляем существующие позиции если есть
    await supabase
      .from('estimate_items')
      .delete()
      .eq('estimate_id', estimate_id);

    // Добавляем новые позиции
    const { data: insertedItems, error } = await supabase
      .from('estimate_items')
      .insert(items)
      .select();

    if (error) {
      throw new AppError(`Failed to import items: ${error.message}`, 400);
    }

    // Пересчитываем общую сумму сметы
    await recalculateEstimateTotal(estimate_id);

    logInfo('Estimate imported from Excel', { 
      estimateId: estimate_id, 
      itemsCount: items.length, 
      userId: req.user.id 
    });

    res.json({
      success: true,
      message: `Successfully imported ${items.length} items from Excel`,
      data: {
        imported_items: items.length,
        items: insertedItems
      }
    } as ApiResponse<any>);

  } catch (error: any) {
    throw new AppError(`Failed to process Excel file: ${error.message}`, 400);
  }
});

// Экспорт сметы в Excel
export const exportEstimateToExcel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Получаем смету с позициями
  const { data: estimate, error } = await supabase
    .from('estimates')
    .select(`
      *,
      projects(name),
      estimate_items(*)
    `)
    .eq('id', id)
    .single();

  if (error || !estimate) {
    throw new AppError('Estimate not found', 404);
  }

  // Создаем Excel файл
  const workbook = XLSX.utils.book_new();
  
  // Заголовки для позиций
  const headers = [
    'Номер', 'Наименование работ', 'Ед.изм.', 'Количество', 
    'Цена за ед.', 'Общая стоимость', 'Трудозатраты', 
    'Стоимость материалов', 'Стоимость оборудования', 'Примечания'
  ];

  // Данные позиций
  const itemsData = [
    headers,
    ...estimate.estimate_items.map((item: any) => [
      item.order_number,
      item.name,
      item.unit,
      item.quantity,
      item.unit_price,
      item.total_price,
      item.labor_cost || 0,
      item.material_cost || 0,
      item.equipment_cost || 0,
      item.notes || ''
    ])
  ];

  // Добавляем итоговую строку
  const totalRow = [
    '',
    'ИТОГО:',
    '',
    '',
    '',
    estimate.total_amount || 0,
    estimate.labor_cost || 0,
    estimate.material_cost || 0,
    estimate.equipment_cost || 0,
    ''
  ];
  itemsData.push(totalRow);

  const worksheet = XLSX.utils.aoa_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Смета');

  // Создаем буфер
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=estimate_${estimate.number || id}.xlsx`);
  
  res.send(buffer);
});

// Копировать смету
export const copyEstimate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;
  const { name, project_id } = req.body;

  // Получаем исходную смету с позициями
  const { data: originalEstimate, error } = await supabase
    .from('estimates')
    .select(`
      *,
      estimate_items(*)
    `)
    .eq('id', id)
    .single();

  if (error || !originalEstimate) {
    throw new AppError('Original estimate not found', 404);
  }

  // Создаем новую смету
  const newEstimateData = {
    ...originalEstimate,
    id: undefined,
    name: name || `${originalEstimate.name} (копия)`,
    project_id: project_id || originalEstimate.project_id,
    number: undefined, // Будет сгенерирован автоматически
    version: 1,
    status: 'draft',
    created_by: req.user.id,
    approved_by: null,
    approved_at: null,
    created_at: undefined,
    updated_at: undefined
  };

  const newEstimate = await dbService.create<Estimate>('estimates', newEstimateData);

  // Копируем позиции сметы
  if (originalEstimate.estimate_items && originalEstimate.estimate_items.length > 0) {
    const newItems = originalEstimate.estimate_items.map((item: any) => ({
      ...item,
      id: undefined,
      estimate_id: newEstimate.id,
      created_at: undefined
    }));

    await supabase
      .from('estimate_items')
      .insert(newItems);
  }

  logInfo('Estimate copied', { 
    originalId: id, 
    newId: newEstimate.id, 
    userId: req.user.id 
  });

  res.status(201).json({
    success: true,
    message: 'Estimate copied successfully',
    data: newEstimate
  } as ApiResponse<Estimate>);
});

// Вспомогательная функция для пересчета общей суммы сметы
async function recalculateEstimateTotal(estimateId: string): Promise<void> {
  const { data: items } = await supabase
    .from('estimate_items')
    .select('total_price, labor_cost, material_cost, equipment_cost')
    .eq('estimate_id', estimateId);

  if (items) {
    const totals = items.reduce((acc, item) => ({
      total_amount: acc.total_amount + (Number(item.total_price) || 0),
      labor_cost: acc.labor_cost + (Number(item.labor_cost) || 0),
      material_cost: acc.material_cost + (Number(item.material_cost) || 0),
      equipment_cost: acc.equipment_cost + (Number(item.equipment_cost) || 0)
    }), {
      total_amount: 0,
      labor_cost: 0,
      material_cost: 0,
      equipment_cost: 0
    });

    await supabase
      .from('estimates')
      .update(totals)
      .eq('id', estimateId);
  }
}