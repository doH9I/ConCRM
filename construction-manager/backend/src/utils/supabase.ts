import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Клиент с Service Role для административных операций
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Клиент с Anon Key для пользовательских операций
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Утилиты для работы с базой данных
export class SupabaseService {
  private client;

  constructor(useServiceRole = false) {
    this.client = useServiceRole ? supabaseAdmin : supabase;
  }

  // Универсальный метод для выполнения запросов с обработкой ошибок
  async executeQuery<T>(
    queryBuilder: any,
    errorMessage = 'Database query failed'
  ): Promise<T> {
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error(`${errorMessage}:`, error);
      throw new Error(`${errorMessage}: ${error.message}`);
    }

    return data;
  }

  // Получить данные с пагинацией
  async getPaginated<T>(
    table: string,
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    
    let query = this.client.from(table).select('*', { count: 'exact' });
    
    // Применяем фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key.includes('search')) {
          query = query.ilike('name', `%${value}%`);
        } else if (key.includes('date_from')) {
          query = query.gte('created_at', value);
        } else if (key.includes('date_to')) {
          query = query.lte('created_at', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Применяем сортировку
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    // Применяем пагинацию
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch ${table}: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages
    };
  }

  // Создать запись
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    return this.executeQuery<T>(
      this.client.from(table).insert(data).select().single(),
      `Failed to create record in ${table}`
    );
  }

  // Обновить запись
  async update<T>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    return this.executeQuery<T>(
      this.client.from(table).update(data).eq('id', id).select().single(),
      `Failed to update record in ${table}`
    );
  }

  // Удалить запись
  async delete(table: string, id: string): Promise<void> {
    await this.executeQuery(
      this.client.from(table).delete().eq('id', id),
      `Failed to delete record from ${table}`
    );
  }

  // Получить запись по ID
  async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Запись не найдена
      }
      throw new Error(`Failed to fetch record from ${table}: ${error.message}`);
    }

    return data;
  }

  // Получить записи по условию
  async getBy<T>(
    table: string,
    conditions: Record<string, any>
  ): Promise<T[]> {
    let query = this.client.from(table).select('*');

    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return this.executeQuery<T[]>(
      query,
      `Failed to fetch records from ${table}`
    );
  }

  // Выполнить RPC функцию
  async rpc<T>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    return this.executeQuery<T>(
      this.client.rpc(functionName, params),
      `Failed to execute RPC function ${functionName}`
    );
  }

  // Загрузить файл в Storage
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer | File,
    options?: {
      contentType?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<{ path: string; publicUrl: string }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        metadata: options?.metadata,
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: publicUrlData } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    };
  }

  // Удалить файл из Storage
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Получить подписанный URL для файла
  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  // Получить статистику
  async getStatistics(queries: Record<string, string>): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const { count } = await this.client
          .from(query.split(' ')[2]) // Извлекаем имя таблицы из SELECT count(*) FROM table_name
          .select('*', { count: 'exact', head: true });
        
        results[key] = count || 0;
      } catch (error) {
        console.error(`Failed to get statistics for ${key}:`, error);
        results[key] = 0;
      }
    }

    return results;
  }
}

// Экземпляры сервиса
export const dbService = new SupabaseService(false); // Для пользовательских операций
export const dbAdminService = new SupabaseService(true); // Для административных операций

export default supabase;