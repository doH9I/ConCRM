-- Construction Manager Database Schema
-- Миграция 002: Row Level Security (RLS) политики

-- Включаем RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ks_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ks_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для companies
CREATE POLICY "Users can view companies they have access to" ON companies FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM employees WHERE is_active = true
        UNION
        SELECT created_by FROM companies WHERE id = companies.id
    )
);
CREATE POLICY "Company creators can update their companies" ON companies FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Authenticated users can create companies" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политики для projects
CREATE POLICY "Users can view projects they participate in" ON projects FOR SELECT USING (
    auth.uid() = manager_id OR
    auth.uid() IN (
        SELECT assigned_to FROM tasks WHERE project_id = projects.id
        UNION
        SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        UNION
        SELECT employee.user_id FROM employees employee
        JOIN time_tracking tt ON tt.employee_id = employee.id
        WHERE tt.project_id = projects.id
    )
);
CREATE POLICY "Project managers can update their projects" ON projects FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Authenticated users can create projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политики для project_stages
CREATE POLICY "Users can view stages of accessible projects" ON project_stages FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);
CREATE POLICY "Project managers and stage responsible can update stages" ON project_stages FOR UPDATE USING (
    auth.uid() = responsible_id OR
    project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id)
);
CREATE POLICY "Project managers can create stages" ON project_stages FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id)
);

-- Политики для tasks
CREATE POLICY "Users can view tasks they're involved in" ON tasks FOR SELECT USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id)
);
CREATE POLICY "Users can update tasks assigned to them or created by them" ON tasks FOR UPDATE USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id)
);
CREATE POLICY "Users can create tasks in accessible projects" ON tasks FOR INSERT WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);

-- Политики для employees
CREATE POLICY "Users can view employees in their company" ON employees FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM employees e2 
        WHERE e2.user_id = auth.uid() 
        AND e2.is_active = true
    )
);
CREATE POLICY "Users can update own employee record" ON employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create employee records" ON employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политики для time_tracking
CREATE POLICY "Users can view own time tracking" ON time_tracking FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
    project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id)
);
CREATE POLICY "Users can update own time tracking" ON time_tracking FOR UPDATE USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own time tracking" ON time_tracking FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

-- Политики для materials
CREATE POLICY "Users can view all materials" ON materials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage materials" ON materials FOR ALL USING (auth.role() = 'authenticated');

-- Политики для warehouse_operations
CREATE POLICY "Users can view warehouse operations for accessible projects" ON warehouse_operations FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);
CREATE POLICY "Users can manage warehouse operations for accessible projects" ON warehouse_operations FOR ALL USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);

-- Политики для material_stock
CREATE POLICY "Users can view stock for accessible projects" ON material_stock FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);
CREATE POLICY "Users can manage stock for accessible projects" ON material_stock FOR ALL USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);

-- Политики для financial_operations
CREATE POLICY "Users can view financial operations for accessible projects" ON financial_operations FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id) OR
    auth.uid() = responsible_id
);
CREATE POLICY "Project managers can manage financial operations" ON financial_operations FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE auth.uid() = manager_id)
);

-- Политики для estimates
CREATE POLICY "Users can view estimates for accessible projects" ON estimates FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);
CREATE POLICY "Users can manage estimates for accessible projects" ON estimates FOR ALL USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);

-- Политики для estimate_items
CREATE POLICY "Users can view estimate items for accessible estimates" ON estimate_items FOR SELECT USING (
    estimate_id IN (
        SELECT id FROM estimates WHERE 
        project_id IN (
            SELECT id FROM projects WHERE 
            auth.uid() = manager_id OR
            auth.uid() IN (
                SELECT assigned_to FROM tasks WHERE project_id = projects.id
                UNION
                SELECT responsible_id FROM project_stages WHERE project_id = projects.id
            )
        )
    )
);
CREATE POLICY "Users can manage estimate items for accessible estimates" ON estimate_items FOR ALL USING (
    estimate_id IN (
        SELECT id FROM estimates WHERE 
        project_id IN (
            SELECT id FROM projects WHERE 
            auth.uid() = manager_id OR
            auth.uid() IN (
                SELECT assigned_to FROM tasks WHERE project_id = projects.id
                UNION
                SELECT responsible_id FROM project_stages WHERE project_id = projects.id
            )
        )
    )
);

-- Политики для ks_reports
CREATE POLICY "Users can view KS reports for accessible projects" ON ks_reports FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);
CREATE POLICY "Users can manage KS reports for accessible projects" ON ks_reports FOR ALL USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    )
);

-- Политики для ks_items
CREATE POLICY "Users can view KS items for accessible reports" ON ks_items FOR SELECT USING (
    ks_report_id IN (
        SELECT id FROM ks_reports WHERE 
        project_id IN (
            SELECT id FROM projects WHERE 
            auth.uid() = manager_id OR
            auth.uid() IN (
                SELECT assigned_to FROM tasks WHERE project_id = projects.id
                UNION
                SELECT responsible_id FROM project_stages WHERE project_id = projects.id
            )
        )
    )
);
CREATE POLICY "Users can manage KS items for accessible reports" ON ks_items FOR ALL USING (
    ks_report_id IN (
        SELECT id FROM ks_reports WHERE 
        project_id IN (
            SELECT id FROM projects WHERE 
            auth.uid() = manager_id OR
            auth.uid() IN (
                SELECT assigned_to FROM tasks WHERE project_id = projects.id
                UNION
                SELECT responsible_id FROM project_stages WHERE project_id = projects.id
            )
        )
    )
);

-- Политики для defects
CREATE POLICY "Users can view defects for accessible projects" ON defects FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    ) OR
    auth.uid() = found_by OR
    auth.uid() = assigned_to
);
CREATE POLICY "Users can manage defects for accessible projects" ON defects FOR ALL USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        auth.uid() = manager_id OR
        auth.uid() IN (
            SELECT assigned_to FROM tasks WHERE project_id = projects.id
            UNION
            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
        )
    ) OR
    auth.uid() = found_by OR
    auth.uid() = assigned_to
);

-- Политики для attachments
CREATE POLICY "Users can view attachments for accessible entities" ON attachments FOR SELECT USING (
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
    auth.uid() = uploaded_by
);
CREATE POLICY "Users can upload attachments" ON attachments FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update own attachments" ON attachments FOR UPDATE USING (auth.uid() = uploaded_by);

-- Политики для company_settings
CREATE POLICY "Users can view settings for their company" ON company_settings FOR SELECT USING (
    company_id IN (
        SELECT id FROM companies WHERE created_by = auth.uid()
        UNION
        SELECT companies.id FROM companies
        JOIN employees ON companies.id = (
            SELECT companies.id FROM companies 
            WHERE companies.created_by = (
                SELECT created_by FROM companies 
                WHERE id = (
                    SELECT company_id FROM company_settings cs2 
                    WHERE cs2.id = company_settings.id
                )
            )
        )
        WHERE employees.user_id = auth.uid() AND employees.is_active = true
    )
);
CREATE POLICY "Company owners can manage settings" ON company_settings FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
);