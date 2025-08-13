export declare const supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare class SupabaseService {
    private client;
    constructor(useServiceRole?: boolean);
    executeQuery<T>(queryBuilder: any, errorMessage?: string): Promise<T>;
    getPaginated<T>(table: string, page?: number, limit?: number, filters?: Record<string, any>, orderBy?: {
        column: string;
        ascending?: boolean;
    }): Promise<{
        data: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create<T>(table: string, data: Partial<T>): Promise<T>;
    update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
    delete(table: string, id: string): Promise<void>;
    getById<T>(table: string, id: string): Promise<T | null>;
    getBy<T>(table: string, conditions: Record<string, any>): Promise<T[]>;
    rpc<T>(functionName: string, params?: Record<string, any>): Promise<T>;
    uploadFile(bucket: string, path: string, file: Buffer | File, options?: {
        contentType?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        path: string;
        publicUrl: string;
    }>;
    deleteFile(bucket: string, path: string): Promise<void>;
    getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
    getStatistics(queries: Record<string, string>): Promise<Record<string, number>>;
}
export declare const dbService: SupabaseService;
export declare const dbAdminService: SupabaseService;
export default supabase;
//# sourceMappingURL=supabase.d.ts.map