import { Response } from 'express';
import { dbService, supabase } from '../utils/supabase';
import { AuthenticatedRequest, Material, WarehouseOperation, MaterialStock, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo } from '../middleware/logger';

// Получить все материалы
export const getMaterials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    category,
    supplier,
    search,
    min_stock_alert = 'false',
    sort = 'name',
    order = 'asc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (category) filters.category = category;
  if (supplier) filters.supplier = supplier;
  if (search) filters.search = search;

  let result = await dbService.getPaginated<Material>(
    'materials',
    parseInt(page as string),
    parseInt(limit as string),
    filters,
    { column: sort as string, ascending: order === 'asc' }
  );

  // Если запрошены материалы с низким остатком
  if (min_stock_alert === 'true') {
    const { data: lowStockMaterials } = await supabase
      .from('materials')
      .select(`
        *,
        material_stock!inner(current_stock)
      `)
      .lt('material_stock.current_stock', supabase.raw('materials.min_stock'));

    result.data = lowStockMaterials || [];
    result.total = lowStockMaterials?.length || 0;
  }

  res.json({
    success: true,
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  } as PaginatedResponse<Material>);
});

// Получить материал по ID
export const getMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Получаем материал с информацией об остатках
  const { data: material, error } = await supabase
    .from('materials')
    .select(`
      *,
      material_stock(
        current_stock,
        reserved_stock,
        last_updated,
        projects(name)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !material) {
    throw new AppError('Material not found', 404);
  }

  res.json({
    success: true,
    data: material
  } as ApiResponse<any>);
});

// Создать новый материал
export const createMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  // Генерируем код материала если не указан
  if (!req.body.code) {
    const { count } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });
    
    req.body.code = `MAT${String((count || 0) + 1).padStart(4, '0')}`;
  }

  const material = await dbService.create<Material>('materials', req.body);

  logInfo('Material created', { materialId: material.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Material created successfully',
    data: material
  } as ApiResponse<Material>);
});

// Обновить материал
export const updateMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const material = await dbService.update<Material>('materials', id, req.body);

  logInfo('Material updated', { materialId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Material updated successfully',
    data: material
  } as ApiResponse<Material>);
});

// Удалить материал
export const deleteMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Проверяем, есть ли операции с этим материалом
  const { count } = await supabase
    .from('warehouse_operations')
    .select('*', { count: 'exact', head: true })
    .eq('material_id', id);

  if (count && count > 0) {
    throw new AppError('Cannot delete material with existing warehouse operations', 400);
  }

  await dbService.delete('materials', id);

  logInfo('Material deleted', { materialId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Material deleted successfully'
  } as ApiResponse);
});

// Получить складские операции
export const getWarehouseOperations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    material_id,
    project_id,
    operation_type,
    date_from,
    date_to,
    sort = 'created_at',
    order = 'desc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (material_id) filters.material_id = material_id;
  if (project_id) filters.project_id = project_id;
  if (operation_type) filters.operation_type = operation_type;
  if (date_from) filters.date_from = date_from;
  if (date_to) filters.date_to = date_to;

  const result = await dbService.getPaginated<WarehouseOperation>(
    'warehouse_operations',
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
  } as PaginatedResponse<WarehouseOperation>);
});

// Создать складскую операцию
export const createWarehouseOperation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const operationData = {
    ...req.body,
    responsible_id: req.user.id,
    document_date: req.body.document_date || new Date().toISOString().split('T')[0]
  };

  // Рассчитываем общую стоимость если не указана
  if (!operationData.total_price && operationData.quantity && operationData.unit_price) {
    operationData.total_price = operationData.quantity * operationData.unit_price;
  }

  const operation = await dbService.create<WarehouseOperation>('warehouse_operations', operationData);

  logInfo('Warehouse operation created', { operationId: operation.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Warehouse operation created successfully',
    data: operation
  } as ApiResponse<WarehouseOperation>);
});

// Обновить складскую операцию
export const updateWarehouseOperation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Рассчитываем общую стоимость если изменились количество или цена
  if (req.body.quantity || req.body.unit_price) {
    const currentOperation = await dbService.getById<WarehouseOperation>('warehouse_operations', id);
    if (currentOperation) {
      const quantity = req.body.quantity || currentOperation.quantity;
      const unitPrice = req.body.unit_price || currentOperation.unit_price;
      req.body.total_price = quantity * unitPrice;
    }
  }

  const operation = await dbService.update<WarehouseOperation>('warehouse_operations', id, req.body);

  logInfo('Warehouse operation updated', { operationId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Warehouse operation updated successfully',
    data: operation
  } as ApiResponse<WarehouseOperation>);
});

// Удалить складскую операцию
export const deleteWarehouseOperation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await dbService.delete('warehouse_operations', id);

  logInfo('Warehouse operation deleted', { operationId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Warehouse operation deleted successfully'
  } as ApiResponse);
});

// Получить остатки материалов
export const getMaterialStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    project_id,
    material_id,
    low_stock = 'false',
    sort = 'current_stock',
    order = 'asc'
  } = req.query;

  let query = supabase
    .from('material_stock')
    .select(`
      *,
      materials(name, code, unit, min_stock),
      projects(name)
    `);

  if (project_id) query = query.eq('project_id', project_id);
  if (material_id) query = query.eq('material_id', material_id);
  
  if (low_stock === 'true') {
    query = query.lt('current_stock', supabase.raw('materials.min_stock'));
  }

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  query = query.range(offset, offset + parseInt(limit as string) - 1);

  const { data: stock, error, count } = await query;

  if (error) {
    throw new AppError(`Failed to fetch material stock: ${error.message}`, 400);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / parseInt(limit as string));

  res.json({
    success: true,
    data: stock || [],
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages
    }
  } as PaginatedResponse<any>);
});

// Получить статистику склада
export const getWarehouseStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { project_id, date_from, date_to } = req.query;

  let operationsQuery = supabase.from('warehouse_operations').select('*');
  
  if (project_id) operationsQuery = operationsQuery.eq('project_id', project_id);
  if (date_from) operationsQuery = operationsQuery.gte('document_date', date_from);
  if (date_to) operationsQuery = operationsQuery.lte('document_date', date_to);

  const { data: operations } = await operationsQuery;

  // Получаем общую статистику
  const [
    { count: totalMaterials },
    { count: lowStockMaterials },
    { data: stockData }
  ] = await Promise.all([
    supabase.from('materials').select('*', { count: 'exact', head: true }),
    supabase.from('material_stock').select('*, materials!inner(min_stock)', { count: 'exact', head: true })
      .lt('current_stock', supabase.raw('materials.min_stock')),
    supabase.from('material_stock').select('current_stock, reserved_stock')
  ]);

  const stats = {
    materials: {
      total: totalMaterials || 0,
      low_stock: lowStockMaterials || 0
    },
    operations: {
      total: operations?.length || 0,
      receipts: operations?.filter(op => op.operation_type === 'receipt').length || 0,
      consumptions: operations?.filter(op => op.operation_type === 'consumption').length || 0,
      transfers: operations?.filter(op => op.operation_type === 'transfer').length || 0,
      write_offs: operations?.filter(op => op.operation_type === 'write_off').length || 0
    },
    stock: {
      total_value: operations?.reduce((sum, op) => sum + (Number(op.total_price) || 0), 0) || 0,
      current_stock_items: stockData?.reduce((sum, item) => sum + (item.current_stock || 0), 0) || 0,
      reserved_stock_items: stockData?.reduce((sum, item) => sum + (item.reserved_stock || 0), 0) || 0
    },
    categories: {} as Record<string, number>
  };

  // Статистика по категориям
  const { data: categories } = await supabase
    .from('materials')
    .select('category')
    .not('category', 'is', null);

  categories?.forEach(item => {
    if (item.category) {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    }
  });

  res.json({
    success: true,
    data: stats
  } as ApiResponse<any>);
});

// Получить отчет по движению материалов
export const getMaterialMovementReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { material_id, project_id, date_from, date_to } = req.query;

  if (!material_id) {
    throw new AppError('Material ID is required', 400);
  }

  let query = supabase
    .from('warehouse_operations')
    .select(`
      *,
      projects(name),
      materials(name, code, unit)
    `)
    .eq('material_id', material_id)
    .order('document_date', { ascending: true });

  if (project_id) query = query.eq('project_id', project_id);
  if (date_from) query = query.gte('document_date', date_from);
  if (date_to) query = query.lte('document_date', date_to);

  const { data: operations } = await query;

  let runningBalance = 0;
  const movements = operations?.map(op => {
    const quantity = Number(op.quantity);
    
    if (op.operation_type === 'receipt') {
      runningBalance += quantity;
    } else if (op.operation_type === 'consumption' || op.operation_type === 'write_off') {
      runningBalance -= quantity;
    }

    return {
      ...op,
      running_balance: runningBalance
    };
  }) || [];

  res.json({
    success: true,
    data: {
      movements,
      summary: {
        total_receipts: operations?.filter(op => op.operation_type === 'receipt')
          .reduce((sum, op) => sum + Number(op.quantity), 0) || 0,
        total_consumptions: operations?.filter(op => op.operation_type === 'consumption')
          .reduce((sum, op) => sum + Number(op.quantity), 0) || 0,
        final_balance: runningBalance
      }
    }
  } as ApiResponse<any>);
});

// Резервирование материалов
export const reserveMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { material_id, project_id, quantity } = req.body;

  if (!material_id || !project_id || !quantity || quantity <= 0) {
    throw new AppError('Material ID, project ID, and positive quantity are required', 400);
  }

  // Получаем текущий остаток
  const { data: stock } = await supabase
    .from('material_stock')
    .select('*')
    .eq('material_id', material_id)
    .eq('project_id', project_id)
    .single();

  if (!stock) {
    throw new AppError('Material stock not found for this project', 404);
  }

  const availableQuantity = stock.current_stock - stock.reserved_stock;
  if (quantity > availableQuantity) {
    throw new AppError(`Insufficient stock. Available: ${availableQuantity}`, 400);
  }

  // Обновляем резерв
  const { data: updatedStock } = await supabase
    .from('material_stock')
    .update({
      reserved_stock: stock.reserved_stock + quantity,
      last_updated: new Date().toISOString()
    })
    .eq('material_id', material_id)
    .eq('project_id', project_id)
    .select()
    .single();

  logInfo('Material reserved', { 
    materialId: material_id, 
    projectId: project_id, 
    quantity, 
    userId: req.user?.id 
  });

  res.json({
    success: true,
    message: 'Material reserved successfully',
    data: updatedStock
  } as ApiResponse<any>);
});

// Снятие резерва материалов
export const unreserveMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { material_id, project_id, quantity } = req.body;

  if (!material_id || !project_id || !quantity || quantity <= 0) {
    throw new AppError('Material ID, project ID, and positive quantity are required', 400);
  }

  // Получаем текущий остаток
  const { data: stock } = await supabase
    .from('material_stock')
    .select('*')
    .eq('material_id', material_id)
    .eq('project_id', project_id)
    .single();

  if (!stock) {
    throw new AppError('Material stock not found for this project', 404);
  }

  if (quantity > stock.reserved_stock) {
    throw new AppError(`Cannot unreserve more than reserved. Reserved: ${stock.reserved_stock}`, 400);
  }

  // Обновляем резерв
  const { data: updatedStock } = await supabase
    .from('material_stock')
    .update({
      reserved_stock: Math.max(0, stock.reserved_stock - quantity),
      last_updated: new Date().toISOString()
    })
    .eq('material_id', material_id)
    .eq('project_id', project_id)
    .select()
    .single();

  logInfo('Material unreserved', { 
    materialId: material_id, 
    projectId: project_id, 
    quantity, 
    userId: req.user?.id 
  });

  res.json({
    success: true,
    message: 'Material unreserved successfully',
    data: updatedStock
  } as ApiResponse<any>);
});