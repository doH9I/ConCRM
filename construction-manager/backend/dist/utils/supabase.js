"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbAdminService = exports.dbService = exports.SupabaseService = exports.supabase = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
class SupabaseService {
    constructor(useServiceRole = false) {
        this.client = useServiceRole ? exports.supabaseAdmin : exports.supabase;
    }
    async executeQuery(queryBuilder, errorMessage = 'Database query failed') {
        const { data, error } = await queryBuilder;
        if (error) {
            console.error(`${errorMessage}:`, error);
            throw new Error(`${errorMessage}: ${error.message}`);
        }
        return data;
    }
    async getPaginated(table, page = 1, limit = 10, filters = {}, orderBy) {
        const offset = (page - 1) * limit;
        let query = this.client.from(table).select('*', { count: 'exact' });
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key.includes('search')) {
                    query = query.ilike('name', `%${value}%`);
                }
                else if (key.includes('date_from')) {
                    query = query.gte('created_at', value);
                }
                else if (key.includes('date_to')) {
                    query = query.lte('created_at', value);
                }
                else {
                    query = query.eq(key, value);
                }
            }
        });
        if (orderBy) {
            query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }
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
    async create(table, data) {
        return this.executeQuery(this.client.from(table).insert(data).select().single(), `Failed to create record in ${table}`);
    }
    async update(table, id, data) {
        return this.executeQuery(this.client.from(table).update(data).eq('id', id).select().single(), `Failed to update record in ${table}`);
    }
    async delete(table, id) {
        await this.executeQuery(this.client.from(table).delete().eq('id', id), `Failed to delete record from ${table}`);
    }
    async getById(table, id) {
        const { data, error } = await this.client
            .from(table)
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(`Failed to fetch record from ${table}: ${error.message}`);
        }
        return data;
    }
    async getBy(table, conditions) {
        let query = this.client.from(table).select('*');
        Object.entries(conditions).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        return this.executeQuery(query, `Failed to fetch records from ${table}`);
    }
    async rpc(functionName, params = {}) {
        return this.executeQuery(this.client.rpc(functionName, params), `Failed to execute RPC function ${functionName}`);
    }
    async uploadFile(bucket, path, file, options) {
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
    async deleteFile(bucket, path) {
        const { error } = await this.client.storage
            .from(bucket)
            .remove([path]);
        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    async getSignedUrl(bucket, path, expiresIn = 3600) {
        const { data, error } = await this.client.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);
        if (error) {
            throw new Error(`Failed to create signed URL: ${error.message}`);
        }
        return data.signedUrl;
    }
    async getStatistics(queries) {
        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            try {
                const { count } = await this.client
                    .from(query.split(' ')[2])
                    .select('*', { count: 'exact', head: true });
                results[key] = count || 0;
            }
            catch (error) {
                console.error(`Failed to get statistics for ${key}:`, error);
                results[key] = 0;
            }
        }
        return results;
    }
}
exports.SupabaseService = SupabaseService;
exports.dbService = new SupabaseService(false);
exports.dbAdminService = new SupabaseService(true);
exports.default = exports.supabase;
//# sourceMappingURL=supabase.js.map