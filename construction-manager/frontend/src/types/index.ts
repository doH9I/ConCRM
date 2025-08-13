// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User and Auth types
export interface User extends BaseEntity {
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'employee';
  avatar_url?: string;
  phone?: string;
  position?: string;
}

// Project types
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  budget: number;
  client_name: string;
  client_contact?: string;
  manager_id: string;
  address?: string;
  progress: number;
}

export interface ProjectStage extends BaseEntity {
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  responsible_id?: string;
  budget: number;
  order_index: number;
}

// Task types
export interface Task extends BaseEntity {
  project_id: string;
  stage_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

// Employee types
export interface Employee extends BaseEntity {
  user_id?: string;
  full_name: string;
  position: string;
  department?: string;
  hire_date: string;
  salary: number;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'on_leave';
  skills?: string[];
}

export interface TimeEntry extends BaseEntity {
  employee_id: string;
  project_id?: string;
  task_id?: string;
  date: string;
  hours: number;
  description?: string;
  is_overtime: boolean;
}

// Financial types
export interface FinancialOperation extends BaseEntity {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  project_id?: string;
  employee_id?: string;
  is_recurring: boolean;
  recurring_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Budget extends BaseEntity {
  project_id?: string;
  category: string;
  planned_amount: number;
  actual_amount: number;
  period_start: string;
  period_end: string;
}

// Material types
export interface Material extends BaseEntity {
  name: string;
  description?: string;
  unit: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit_price: number;
  supplier?: string;
}

export interface MaterialOperation extends BaseEntity {
  material_id: string;
  type: 'receipt' | 'consumption' | 'transfer' | 'inventory';
  quantity: number;
  unit_price?: number;
  project_id?: string;
  description?: string;
  date: string;
  document_number?: string;
}

// Estimate types
export interface Estimate extends BaseEntity {
  project_id?: string;
  name: string;
  description?: string;
  version: number;
  status: 'draft' | 'active' | 'approved' | 'archived' | 'in_review';
  total_cost: number;
  total_amount?: number;
  total_with_vat?: number;
  items_count?: number;
  labor_cost: number;
  material_cost: number;
  equipment_cost: number;
  overhead_cost: number;
  profit_margin: number;
  created_by: string;
  approved_by?: string;
  approved_date?: string;
}

export interface EstimateItem extends BaseEntity {
  estimate_id: string;
  category: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  labor_hours?: number;
  material_cost?: number;
  equipment_cost?: number;
  order_index: number;
}

// Defect types
export interface Defect extends BaseEntity {
  project_id: string;
  title: string;
  description: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'verified';
  reported_by: string;
  assigned_to?: string;
  due_date?: string;
  resolution?: string;
  resolved_date?: string;
  verified_by?: string;
  verified_date?: string;
}

// Document types
export interface Document extends BaseEntity {
  name: string;
  type: 'pdf' | 'image' | 'excel' | 'word' | 'other';
  size: number;
  url: string;
  project_id?: string;
  uploaded_by: string;
  description?: string;
  tags?: string[];
  is_public: boolean;
  ocr_text?: string;
}

// Comment types
export interface Comment extends BaseEntity {
  entity_type: 'project' | 'task' | 'defect' | 'document';
  entity_id: string;
  content: string;
  author_id: string;
  parent_id?: string;
}

// Attachment types
export interface Attachment extends BaseEntity {
  entity_type: 'project' | 'task' | 'defect' | 'estimate';
  entity_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  uploaded_by: string;
}

// Notification types
export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  action_url?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Form types
export interface CreateProjectForm {
  name: string;
  description?: string;
  client_name: string;
  client_contact?: string;
  start_date: string;
  end_date?: string;
  budget: number;
  manager_id: string;
  address?: string;
}

export interface CreateTaskForm {
  project_id: string;
  stage_id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
}

export interface CreateEmployeeForm {
  full_name: string;
  position: string;
  department?: string;
  hire_date: string;
  salary: number;
  phone?: string;
  email?: string;
  status?: string;
  passport_series?: string;
  passport_number?: string;
  passport_issued_by?: string;
  passport_issued_date?: string;
  address?: string;
  birth_date?: string;
  tax_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Filter and Search types
export interface ProjectFilters {
  status?: string[];
  manager_id?: string;
  client_name?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface TaskFilters {
  project_id?: string;
  status?: string[];
  priority?: string[];
  assigned_to?: string;
  due_date_range?: {
    start: string;
    end: string;
  };
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}