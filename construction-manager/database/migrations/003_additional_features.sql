-- Construction Manager Database Schema
-- Миграция 003: Дополнительные функции и таблицы

-- Таблица уведомлений
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    entity_type TEXT, -- project, task, defect, etc.
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица шаблонов документов
CREATE TABLE public.document_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ks2', 'ks3', 'ks6a', 'estimate', 'contract', 'act')),
    template_data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица календарных событий
CREATE TABLE public.calendar_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'deadline', 'milestone', 'inspection')),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    attendees UUID[] DEFAULT '{}',
    location TEXT,
    reminder_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица комментариев
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL, -- project, task, defect, etc.
    entity_id UUID NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица тегов
CREATE TABLE public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#007bff',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Связующая таблица для тегов
CREATE TABLE public.entity_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, tag_id)
);

-- Таблица подрядчиков
CREATE TABLE public.contractors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    inn TEXT,
    kpp TEXT,
    specialization TEXT[],
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица договоров
CREATE TABLE public.contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    contract_number TEXT NOT NULL,
    contract_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'RUB',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    description TEXT,
    terms TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, contract_number)
);

-- Таблица актов выполненных работ
CREATE TABLE public.work_acts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    act_number TEXT NOT NULL,
    act_date DATE NOT NULL,
    work_period_start DATE,
    work_period_end DATE,
    total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, act_number)
);

-- Таблица позиций актов
CREATE TABLE public.work_act_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    work_act_id UUID REFERENCES work_acts(id) ON DELETE CASCADE,
    order_number INTEGER,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(work_act_id, order_number)
);

-- Таблица оборудования
CREATE TABLE public.equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(12,2) CHECK (purchase_price >= 0),
    current_value DECIMAL(12,2) CHECK (current_value >= 0),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'repair', 'retired')),
    location TEXT,
    responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    maintenance_interval INTEGER, -- дни
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица использования оборудования
CREATE TABLE public.equipment_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    hours_used DECIMAL(8,2) CHECK (hours_used >= 0),
    fuel_consumed DECIMAL(8,2) CHECK (fuel_consumed >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица истории изменений
CREATE TABLE public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Таблица резервного копирования
CREATE TABLE public.backup_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('manual', 'scheduled', 'before_migration')),
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    file_path TEXT,
    file_size BIGINT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Создание индексов
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_calendar_events_project ON calendar_events(project_id);
CREATE INDEX idx_calendar_events_dates ON calendar_events(start_date, end_date);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_work_acts_project ON work_acts(project_id);
CREATE INDEX idx_work_acts_contract ON work_acts(contract_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_maintenance ON equipment(next_maintenance);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(changed_by);
CREATE INDEX idx_audit_log_date ON audit_log(changed_at);

-- Триггеры для updated_at
CREATE TRIGGER document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contractors_updated_at BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER work_acts_updated_at BEFORE UPDATE ON work_acts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Триггер для автоматического расчета стоимости в work_act_items
CREATE TRIGGER calculate_work_act_item_total_trigger BEFORE INSERT OR UPDATE ON work_act_items FOR EACH ROW EXECUTE FUNCTION calculate_estimate_item_total();

-- Функция для создания уведомлений
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (p_user_id, p_title, p_message, p_type, p_entity_type, p_entity_id)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Функция для автоматического создания уведомлений о просроченных задачах
CREATE OR REPLACE FUNCTION notify_overdue_tasks()
RETURNS void AS $$
DECLARE
    task_record RECORD;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    FOR task_record IN 
        SELECT t.id, t.title, t.due_date, t.assigned_to, p.name as project_name
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.due_date < CURRENT_DATE 
        AND t.status NOT IN ('completed', 'cancelled')
        AND t.assigned_to IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.entity_type = 'task' 
            AND n.entity_id = t.id 
            AND n.created_at > CURRENT_DATE
        )
    LOOP
        notification_title := 'Просроченная задача';
        notification_message := format('Задача "%s" в проекте "%s" просрочена (срок: %s)', 
            task_record.title, task_record.project_name, task_record.due_date);
        
        PERFORM create_notification(
            task_record.assigned_to,
            notification_title,
            notification_message,
            'warning',
            'task',
            task_record.id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Функция для расчета следующего ТО оборудования
CREATE OR REPLACE FUNCTION calculate_next_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_maintenance IS NOT NULL AND NEW.maintenance_interval IS NOT NULL THEN
        NEW.next_maintenance = NEW.last_maintenance + INTERVAL '1 day' * NEW.maintenance_interval;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_maintenance_trigger BEFORE INSERT OR UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION calculate_next_maintenance();

-- RLS политики для новых таблиц
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_act_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Политики для уведомлений
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Политики для шаблонов документов
CREATE POLICY "Authenticated users can view document templates" ON document_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage document templates" ON document_templates FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager'))
);

-- Политики для календарных событий
CREATE POLICY "Users can view calendar events for accessible projects" ON calendar_events FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    ) OR auth.uid() = created_by OR auth.uid() = ANY(attendees)
);

-- Политики для комментариев
CREATE POLICY "Users can view comments for accessible entities" ON comments FOR SELECT USING (
    (entity_type = 'project' AND entity_id::uuid IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )) OR
    (entity_type = 'task' AND entity_id::uuid IN (
        SELECT id FROM tasks WHERE 
        auth.uid() = assigned_to OR 
        auth.uid() = created_by OR
        project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id)
    )) OR
    auth.uid() = author_id
);

-- Политики для оборудования
CREATE POLICY "Authenticated users can view equipment" ON equipment FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage equipment" ON equipment FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager'))
);

-- Политики для аудита
CREATE POLICY "Admins can view audit log" ON audit_log FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);