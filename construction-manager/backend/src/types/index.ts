import { Request } from 'express';

// Базовые типы
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Пользователь
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  position?: string;
  company?: string;
  role: 'admin' | 'manager' | 'user' | 'employee';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Компания
export interface Company extends BaseEntity {
  name: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legal_address?: string;
  actual_address?: string;
  phone?: string;
  email?: string;
  director_name?: string;
  accountant_name?: string;
  logo_url?: string;
  created_by: string;
}

// Проект
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  address?: string;
  client_company_id?: string;
  contractor_company_id?: string;
  manager_id?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'paused';
  start_date?: string;
  end_date?: string;
  planned_end_date?: string;
  budget?: number;
  actual_cost: number;
  progress_percent: number;
}

// Этап проекта
export interface ProjectStage extends BaseEntity {
  project_id: string;
  name: string;
  description?: string;
  order_number: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  planned_end_date?: string;
  budget?: number;
  actual_cost: number;
  responsible_id?: string;
}

// Задача
export interface Task extends BaseEntity {
  project_id: string;
  stage_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_by?: string;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours: number;
}

// Сотрудник
export interface Employee extends BaseEntity {
  user_id?: string;
  employee_number?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  position: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  hourly_rate?: number;
  phone?: string;
  email?: string;
  passport_series?: string;
  passport_number?: string;
  passport_issued_by?: string;
  passport_issued_date?: string;
  address?: string;
  is_active: boolean;
}

// Учет времени
export interface TimeTracking extends BaseEntity {
  employee_id: string;
  project_id: string;
  task_id?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  break_minutes: number;
  total_hours?: number;
  overtime_hours: number;
  description?: string;
  approved_by?: string;
  approved_at?: string;
}

// Материал
export interface Material extends BaseEntity {
  name: string;
  code?: string;
  description?: string;
  unit: string;
  category?: string;
  price?: number;
  supplier?: string;
  min_stock: number;
}

// Складская операция
export interface WarehouseOperation {
  id: string;
  material_id: string;
  project_id: string;
  operation_type: 'receipt' | 'consumption' | 'transfer' | 'write_off';
  quantity: number;
  unit_price?: number;
  total_price?: number;
  document_number?: string;
  document_date?: string;
  supplier?: string;
  responsible_id?: string;
  notes?: string;
  created_at: string;
}

// Остатки материалов
export interface MaterialStock extends BaseEntity {
  material_id: string;
  project_id: string;
  current_stock: number;
  reserved_stock: number;
  last_updated: string;
}

// Финансовая операция
export interface FinancialOperation extends BaseEntity {
  project_id: string;
  operation_type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  description?: string;
  document_number?: string;
  document_date?: string;
  counterparty?: string;
  payment_method?: string;
  account?: string;
  responsible_id?: string;
  approved_by?: string;
  approved_at?: string;
}

// Смета
export interface Estimate extends BaseEntity {
  project_id: string;
  name: string;
  number?: string;
  version: number;
  status: 'draft' | 'approved' | 'active' | 'archived';
  total_amount?: number;
  labor_cost?: number;
  material_cost?: number;
  equipment_cost?: number;
  overhead_percent: number;
  profit_percent: number;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
}

// Позиция сметы
export interface EstimateItem {
  id: string;
  estimate_id: string;
  order_number?: number;
  code?: string;
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  labor_cost?: number;
  material_cost?: number;
  equipment_cost?: number;
  category?: string;
  notes?: string;
  created_at: string;
}

// Справка КС
export interface KsReport extends BaseEntity {
  project_id: string;
  type: 'ks2' | 'ks3' | 'ks6a';
  number: string;
  date: string;
  period_start?: string;
  period_end?: string;
  total_amount?: number;
  previous_amount: number;
  current_amount?: number;
  contractor_name?: string;
  contractor_inn?: string;
  customer_name?: string;
  customer_inn?: string;
  contract_number?: string;
  contract_date?: string;
  status: 'draft' | 'approved' | 'sent';
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
}

// Позиция КС
export interface KsItem extends BaseEntity {
  ks_report_id: string;
  estimate_item_id?: string;
  order_number?: number;
  name: string;
  unit: string;
  total_quantity?: number;
  previous_quantity: number;
  current_quantity?: number;
  unit_price?: number;
  total_amount?: number;
  previous_amount: number;
  current_amount?: number;
}

// Дефектовка
export interface Defect extends BaseEntity {
  project_id: string;
  title: string;
  description: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  found_by?: string;
  assigned_to?: string;
  due_date?: string;
  resolved_at?: string;
  resolution_notes?: string;
  photo_urls?: string[];
}

// Вложения
export interface Attachment extends BaseEntity {
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  entity_type: string;
  entity_id: string;
  uploaded_by?: string;
  ocr_text?: string;
  search_vector?: string;
  description?: string;
}

// Настройки компании
export interface CompanySetting extends BaseEntity {
  company_id: string;
  setting_key: string;
  setting_value: any;
}

// API Response типы
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request типы
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Фильтры
export interface ProjectFilters extends PaginationQuery {
  status?: string;
  manager_id?: string;
  client_company_id?: string;
  search?: string;
}

export interface TaskFilters extends PaginationQuery {
  project_id?: string;
  stage_id?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface FinancialOperationFilters extends PaginationQuery {
  project_id?: string;
  operation_type?: 'income' | 'expense';
  category?: string;
  date_from?: string;
  date_to?: string;
}

// Статистика
export interface ProjectStatistics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  total_spent: number;
  overdue_tasks: number;
}

export interface FinancialStatistics {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  monthly_income: number[];
  monthly_expenses: number[];
  categories_breakdown: { category: string; amount: number; }[];
}

// Отчеты
export interface ReportParams {
  project_id?: string;
  date_from?: string;
  date_to?: string;
  format?: 'pdf' | 'xlsx' | 'csv';
}

// OCR результат
export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
}

// Email типы
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}