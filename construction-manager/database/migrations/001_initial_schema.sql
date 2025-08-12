-- Construction Manager Database Schema
-- Миграция 001: Создание основных таблиц

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Таблица пользователей (расширяет auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    position TEXT,
    company TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'employee')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица компаний/организаций
CREATE TABLE public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    inn TEXT UNIQUE,
    kpp TEXT,
    ogrn TEXT,
    legal_address TEXT,
    actual_address TEXT,
    phone TEXT,
    email TEXT,
    director_name TEXT,
    accountant_name TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица проектов
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    client_company_id UUID REFERENCES companies(id),
    contractor_company_id UUID REFERENCES companies(id),
    manager_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled', 'paused')),
    start_date DATE,
    end_date DATE,
    planned_end_date DATE,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица этапов проекта
CREATE TABLE public.project_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    planned_end_date DATE,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    responsible_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица задач
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES project_stages(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица сотрудников
CREATE TABLE public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    employee_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    position TEXT NOT NULL,
    department TEXT,
    hire_date DATE,
    salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    phone TEXT,
    email TEXT,
    passport_series TEXT,
    passport_number TEXT,
    passport_issued_by TEXT,
    passport_issued_date DATE,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица учета рабочего времени
CREATE TABLE public.time_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    break_minutes INTEGER DEFAULT 0,
    total_hours DECIMAL(4,2),
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    description TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица материалов
CREATE TABLE public.materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    unit TEXT NOT NULL, -- м, кг, шт, м2, м3 и т.д.
    category TEXT,
    price DECIMAL(10,2),
    supplier TEXT,
    min_stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица складских операций
CREATE TABLE public.warehouse_operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    material_id UUID REFERENCES materials(id),
    project_id UUID REFERENCES projects(id),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('receipt', 'consumption', 'transfer', 'write_off')),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2),
    document_number TEXT,
    document_date DATE,
    supplier TEXT,
    responsible_id UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица остатков материалов
CREATE TABLE public.material_stock (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    material_id UUID REFERENCES materials(id),
    project_id UUID REFERENCES projects(id),
    current_stock DECIMAL(10,3) DEFAULT 0,
    reserved_stock DECIMAL(10,3) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(material_id, project_id)
);

-- Таблица финансовых операций
CREATE TABLE public.financial_operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('income', 'expense')),
    category TEXT NOT NULL,
    subcategory TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'RUB',
    description TEXT,
    document_number TEXT,
    document_date DATE,
    counterparty TEXT,
    payment_method TEXT,
    account TEXT,
    responsible_id UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица смет
CREATE TABLE public.estimates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number TEXT,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'archived')),
    total_amount DECIMAL(15,2),
    labor_cost DECIMAL(15,2),
    material_cost DECIMAL(15,2),
    equipment_cost DECIMAL(15,2),
    overhead_percent DECIMAL(5,2) DEFAULT 0,
    profit_percent DECIMAL(5,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица позиций смет
CREATE TABLE public.estimate_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
    order_number INTEGER,
    code TEXT,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    labor_cost DECIMAL(10,2),
    material_cost DECIMAL(10,2),
    equipment_cost DECIMAL(10,2),
    category TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица справок КС
CREATE TABLE public.ks_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('ks2', 'ks3', 'ks6a')),
    number TEXT NOT NULL,
    date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    total_amount DECIMAL(15,2),
    previous_amount DECIMAL(15,2) DEFAULT 0,
    current_amount DECIMAL(15,2),
    contractor_name TEXT,
    contractor_inn TEXT,
    customer_name TEXT,
    customer_inn TEXT,
    contract_number TEXT,
    contract_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent')),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица позиций КС
CREATE TABLE public.ks_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ks_report_id UUID REFERENCES ks_reports(id) ON DELETE CASCADE,
    estimate_item_id UUID REFERENCES estimate_items(id),
    order_number INTEGER,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    total_quantity DECIMAL(10,3),
    previous_quantity DECIMAL(10,3) DEFAULT 0,
    current_quantity DECIMAL(10,3),
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    previous_amount DECIMAL(12,2) DEFAULT 0,
    current_amount DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица дефектовок
CREATE TABLE public.defects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    found_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    due_date DATE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    photo_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица файлов/вложений
CREATE TABLE public.attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    entity_type TEXT NOT NULL, -- project, task, estimate, ks_report, defect, etc.
    entity_id UUID NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    ocr_text TEXT, -- Результат OCR
    search_vector TSVECTOR, -- Для полнотекстового поиска
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица настроек компании
CREATE TABLE public.company_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, setting_key)
);

-- Создание индексов для производительности
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_time_tracking_employee ON time_tracking(employee_id);
CREATE INDEX idx_time_tracking_project ON time_tracking(project_id);
CREATE INDEX idx_time_tracking_date ON time_tracking(date);
CREATE INDEX idx_warehouse_operations_material ON warehouse_operations(material_id);
CREATE INDEX idx_warehouse_operations_project ON warehouse_operations(project_id);
CREATE INDEX idx_financial_operations_project ON financial_operations(project_id);
CREATE INDEX idx_estimates_project ON estimates(project_id);
CREATE INDEX idx_ks_reports_project ON ks_reports(project_id);
CREATE INDEX idx_defects_project ON defects(project_id);
CREATE INDEX idx_defects_assigned ON defects(assigned_to);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_search ON attachments USING GIN(search_vector);

-- Триггеры для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_stages_updated_at BEFORE UPDATE ON project_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER time_tracking_updated_at BEFORE UPDATE ON time_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER financial_operations_updated_at BEFORE UPDATE ON financial_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER estimates_updated_at BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ks_reports_updated_at BEFORE UPDATE ON ks_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER defects_updated_at BEFORE UPDATE ON defects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Триггер для автоматического обновления search_vector в attachments
CREATE OR REPLACE FUNCTION update_attachment_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('russian', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.original_name, '') || ' ' || COALESCE(NEW.ocr_text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attachments_search_vector BEFORE INSERT OR UPDATE ON attachments FOR EACH ROW EXECUTE FUNCTION update_attachment_search_vector();