-- Construction Manager Database Schema
-- Миграция 004: Настройка Supabase Storage

-- Создание buckets для хранения файлов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']),
('photos', 'photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']),
('estimates', 'estimates', false, 104857600, ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']),
('ks-reports', 'ks-reports', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
('contracts', 'contracts', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
('backups', 'backups', false, 1073741824, ARRAY['application/gzip', 'application/x-tar', 'application/zip']);

-- Политики для avatars bucket (публичный)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политики для documents bucket
CREATE POLICY "Users can view documents for accessible projects" ON storage.objects FOR SELECT USING (
    bucket_id = 'documents' AND (
        -- Проверяем доступ через attachments таблицу
        EXISTS (
            SELECT 1 FROM attachments a
            WHERE a.file_path = name
            AND a.entity_type = 'project'
            AND a.entity_id::uuid IN (
                SELECT id FROM projects WHERE 
                auth.uid() = manager_id OR
                auth.uid() IN (
                    SELECT assigned_to FROM tasks WHERE project_id = projects.id
                    UNION
                    SELECT responsible_id FROM project_stages WHERE project_id = projects.id
                )
            )
        )
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.role() = 'authenticated'
);

-- Политики для photos bucket
CREATE POLICY "Users can view photos for accessible entities" ON storage.objects FOR SELECT USING (
    bucket_id = 'photos' AND (
        EXISTS (
            SELECT 1 FROM attachments a
            WHERE a.file_path = name
            AND (
                (a.entity_type = 'project' AND a.entity_id::uuid IN (
                    SELECT id FROM projects WHERE 
                    auth.uid() = manager_id OR
                    auth.uid() IN (
                        SELECT assigned_to FROM tasks WHERE project_id = projects.id
                        UNION
                        SELECT responsible_id FROM project_stages WHERE project_id = projects.id
                    )
                ))
                OR (a.entity_type = 'defect' AND a.entity_id::uuid IN (
                    SELECT id FROM defects WHERE 
                    project_id IN (
                        SELECT id FROM projects WHERE 
                        auth.uid() = manager_id OR
                        auth.uid() IN (
                            SELECT assigned_to FROM tasks WHERE project_id = projects.id
                            UNION
                            SELECT responsible_id FROM project_stages WHERE project_id = projects.id
                        )
                    ) OR auth.uid() = found_by OR auth.uid() = assigned_to
                ))
            )
        )
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

CREATE POLICY "Users can upload photos" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND auth.role() = 'authenticated'
);

-- Политики для estimates bucket
CREATE POLICY "Users can view estimates for accessible projects" ON storage.objects FOR SELECT USING (
    bucket_id = 'estimates' AND (
        EXISTS (
            SELECT 1 FROM attachments a
            JOIN estimates e ON a.entity_id = e.id
            WHERE a.file_path = name
            AND a.entity_type = 'estimate'
            AND e.project_id IN (
                SELECT id FROM projects WHERE 
                auth.uid() = manager_id OR
                auth.uid() IN (
                    SELECT assigned_to FROM tasks WHERE project_id = projects.id
                    UNION
                    SELECT responsible_id FROM project_stages WHERE project_id = projects.id
                )
            )
        )
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

CREATE POLICY "Users can upload estimates" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'estimates' AND auth.role() = 'authenticated'
);

-- Политики для ks-reports bucket
CREATE POLICY "Users can view KS reports for accessible projects" ON storage.objects FOR SELECT USING (
    bucket_id = 'ks-reports' AND (
        EXISTS (
            SELECT 1 FROM attachments a
            JOIN ks_reports k ON a.entity_id = k.id
            WHERE a.file_path = name
            AND a.entity_type = 'ks_report'
            AND k.project_id IN (
                SELECT id FROM projects WHERE 
                auth.uid() = manager_id OR
                auth.uid() IN (
                    SELECT assigned_to FROM tasks WHERE project_id = projects.id
                    UNION
                    SELECT responsible_id FROM project_stages WHERE project_id = projects.id
                )
            )
        )
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

CREATE POLICY "Users can upload KS reports" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'ks-reports' AND auth.role() = 'authenticated'
);

-- Политики для contracts bucket
CREATE POLICY "Users can view contracts for accessible projects" ON storage.objects FOR SELECT USING (
    bucket_id = 'contracts' AND (
        EXISTS (
            SELECT 1 FROM attachments a
            JOIN contracts c ON a.entity_id = c.id
            WHERE a.file_path = name
            AND a.entity_type = 'contract'
            AND c.project_id IN (
                SELECT id FROM projects WHERE 
                auth.uid() = manager_id OR
                auth.uid() IN (
                    SELECT assigned_to FROM tasks WHERE project_id = projects.id
                    UNION
                    SELECT responsible_id FROM project_stages WHERE project_id = projects.id
                )
            )
        )
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

CREATE POLICY "Managers can upload contracts" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'contracts' AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager'))
);

-- Политики для backups bucket (только администраторы)
CREATE POLICY "Admins can manage backups" ON storage.objects FOR ALL USING (
    bucket_id = 'backups' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);