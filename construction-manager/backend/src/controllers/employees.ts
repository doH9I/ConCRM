import { Response } from 'express';
import { dbService, supabase } from '../utils/supabase';
import { AuthenticatedRequest, Employee, TimeTracking, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo } from '../middleware/logger';

// Получить всех сотрудников
export const getEmployees = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    department,
    position,
    is_active = 'true',
    search,
    sort = 'last_name',
    order = 'asc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (department) filters.department = department;
  if (position) filters.position = position;
  if (is_active !== 'all') filters.is_active = is_active === 'true';
  if (search) filters.search = search;

  const result = await dbService.getPaginated<Employee>(
    'employees',
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
  } as PaginatedResponse<Employee>);
});

// Получить сотрудника по ID
export const getEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const employee = await dbService.getById<Employee>('employees', id);

  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  res.json({
    success: true,
    data: employee
  } as ApiResponse<Employee>);
});

// Создать нового сотрудника
export const createEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  // Генерируем номер сотрудника если не указан
  if (!req.body.employee_number) {
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    req.body.employee_number = `EMP${String((count || 0) + 1).padStart(4, '0')}`;
  }

  const employee = await dbService.create<Employee>('employees', req.body);

  logInfo('Employee created', { employeeId: employee.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee
  } as ApiResponse<Employee>);
});

// Обновить сотрудника
export const updateEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const employee = await dbService.update<Employee>('employees', id, req.body);

  logInfo('Employee updated', { employeeId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Employee updated successfully',
    data: employee
  } as ApiResponse<Employee>);
});

// Удалить сотрудника (деактивировать)
export const deleteEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Деактивируем вместо удаления
  await dbService.update<Employee>('employees', id, { is_active: false });

  logInfo('Employee deactivated', { employeeId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Employee deactivated successfully'
  } as ApiResponse);
});

// Получить табель учета времени
export const getTimeTracking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    employee_id,
    project_id,
    date_from,
    date_to,
    sort = 'date',
    order = 'desc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (employee_id) filters.employee_id = employee_id;
  if (project_id) filters.project_id = project_id;
  if (date_from) filters.date_from = date_from;
  if (date_to) filters.date_to = date_to;

  const result = await dbService.getPaginated<TimeTracking>(
    'time_tracking',
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
  } as PaginatedResponse<TimeTracking>);
});

// Добавить запись времени
export const addTimeEntry = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const timeEntry = await dbService.create<TimeTracking>('time_tracking', req.body);

  logInfo('Time entry added', { timeEntryId: timeEntry.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Time entry added successfully',
    data: timeEntry
  } as ApiResponse<TimeTracking>);
});

// Обновить запись времени
export const updateTimeEntry = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const timeEntry = await dbService.update<TimeTracking>('time_tracking', id, req.body);

  logInfo('Time entry updated', { timeEntryId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Time entry updated successfully',
    data: timeEntry
  } as ApiResponse<TimeTracking>);
});

// Удалить запись времени
export const deleteTimeEntry = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await dbService.delete('time_tracking', id);

  logInfo('Time entry deleted', { timeEntryId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Time entry deleted successfully'
  } as ApiResponse);
});

// Утвердить табель
export const approveTimesheet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { employee_id, date_from, date_to } = req.body;

  // Получаем все записи времени в указанном периоде
  const { data: timeEntries, error } = await supabase
    .from('time_tracking')
    .select('*')
    .eq('employee_id', employee_id)
    .gte('date', date_from)
    .lte('date', date_to)
    .is('approved_by', null);

  if (error) {
    throw new AppError(`Failed to fetch time entries: ${error.message}`, 400);
  }

  if (!timeEntries || timeEntries.length === 0) {
    throw new AppError('No time entries found for approval', 404);
  }

  // Утверждаем все записи
  const { error: updateError } = await supabase
    .from('time_tracking')
    .update({
      approved_by: req.user.id,
      approved_at: new Date().toISOString()
    })
    .eq('employee_id', employee_id)
    .gte('date', date_from)
    .lte('date', date_to)
    .is('approved_by', null);

  if (updateError) {
    throw new AppError(`Failed to approve timesheet: ${updateError.message}`, 400);
  }

  logInfo('Timesheet approved', { 
    employeeId: employee_id, 
    dateFrom: date_from, 
    dateTo: date_to, 
    approvedBy: req.user.id 
  });

  res.json({
    success: true,
    message: 'Timesheet approved successfully',
    data: { approved_entries: timeEntries.length }
  } as ApiResponse<any>);
});

// Получить статистику по сотрудникам
export const getEmployeeStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, date_from, date_to } = req.query;

  let query = supabase.from('time_tracking').select('*');
  
  if (employee_id) query = query.eq('employee_id', employee_id);
  if (date_from) query = query.gte('date', date_from);
  if (date_to) query = query.lte('date', date_to);

  const { data: timeEntries } = await query;

  const stats = {
    total_hours: 0,
    overtime_hours: 0,
    working_days: 0,
    projects_worked: new Set(),
    average_hours_per_day: 0
  };

  if (timeEntries) {
    stats.total_hours = timeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
    stats.overtime_hours = timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
    stats.working_days = new Set(timeEntries.map(entry => entry.date)).size;
    stats.projects_worked = new Set(timeEntries.map(entry => entry.project_id));
    stats.average_hours_per_day = stats.working_days > 0 ? stats.total_hours / stats.working_days : 0;
  }

  res.json({
    success: true,
    data: {
      ...stats,
      projects_worked: stats.projects_worked.size
    }
  } as ApiResponse<any>);
});

// Получить отчет по зарплате
export const getSalaryReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, month, year } = req.query;

  if (!employee_id || !month || !year) {
    throw new AppError('Employee ID, month, and year are required', 400);
  }

  // Получаем данные сотрудника
  const employee = await dbService.getById<Employee>('employees', employee_id as string);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  // Получаем записи времени за месяц
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0];

  const { data: timeEntries } = await supabase
    .from('time_tracking')
    .select('*')
    .eq('employee_id', employee_id)
    .gte('date', startDate)
    .lte('date', endDate);

  const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
  const overtimeHours = timeEntries?.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0) || 0;
  const regularHours = totalHours - overtimeHours;

  const baseSalary = employee.salary || 0;
  const hourlyRate = employee.hourly_rate || (baseSalary / 160); // 160 часов в месяц
  
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * 1.5; // Переработка x1.5
  const totalPay = regularPay + overtimePay;

  const report = {
    employee,
    period: { month, year, start_date: startDate, end_date: endDate },
    hours: {
      regular: regularHours,
      overtime: overtimeHours,
      total: totalHours
    },
    salary: {
      base: baseSalary,
      hourly_rate: hourlyRate,
      regular_pay: regularPay,
      overtime_pay: overtimePay,
      total_pay: totalPay
    },
    working_days: timeEntries?.length || 0
  };

  res.json({
    success: true,
    data: report
  } as ApiResponse<any>);
});