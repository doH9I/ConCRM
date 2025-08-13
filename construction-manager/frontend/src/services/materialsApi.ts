import api from './api';
import { Material, MaterialOperation, CreateMaterialForm, ApiResponse } from '../types';

export const materialsApi = {
  // Получить все материалы
  getMaterials: async (page = 1, limit = 20, filters: any = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get<ApiResponse<Material[]>>(`/materials?${params}`);
    return response.data;
  },

  // Получить материал по ID
  getMaterial: async (id: string) => {
    const response = await api.get<ApiResponse<Material>>(`/materials/${id}`);
    return response.data;
  },

  // Создать новый материал
  createMaterial: async (materialData: CreateMaterialForm) => {
    const response = await api.post<ApiResponse<Material>>('/materials', materialData);
    return response.data;
  },

  // Обновить материал
  updateMaterial: async (id: string, materialData: Partial<CreateMaterialForm>) => {
    const response = await api.put<ApiResponse<Material>>(`/materials/${id}`, materialData);
    return response.data;
  },

  // Удалить материал
  deleteMaterial: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/materials/${id}`);
    return response.data;
  },

  // Получить операции с материалами
  getMaterialOperations: async (materialId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await api.get<ApiResponse<MaterialOperation[]>>(`/materials/operations?${params}`);
    return response.data;
  },

  // Добавить операцию с материалом (приход/расход)
  addMaterialOperation: async (operationData: {
    material_id: string;
    type: 'incoming' | 'outgoing' | 'transfer' | 'inventory';
    quantity: number;
    price?: number;
    project_id?: string;
    description?: string;
    document_number?: string;
    supplier?: string;
    recipient?: string;
  }) => {
    const response = await api.post<ApiResponse<MaterialOperation>>('/materials/operations', operationData);
    return response.data;
  },

  // Получить остатки материалов
  getMaterialBalances: async () => {
    const response = await api.get<ApiResponse<any[]>>('/materials/balances');
    return response.data;
  },

  // Резервирование материалов для проекта
  reserveMaterials: async (projectId: string, materials: Array<{ material_id: string; quantity: number }>) => {
    const response = await api.post<ApiResponse<any>>(`/materials/reserve`, { project_id: projectId, materials });
    return response.data;
  },

  // Отмена резервирования
  unreserveMaterials: async (reservationId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/materials/reserve/${reservationId}`);
    return response.data;
  },

  // Получить резервирования
  getReservations: async (projectId?: string) => {
    const params = projectId ? `?project_id=${projectId}` : '';
    const response = await api.get<ApiResponse<any[]>>(`/materials/reservations${params}`);
    return response.data;
  },

  // Экспорт остатков в Excel
  exportBalances: async () => {
    const response = await api.get('/materials/export/balances', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Экспорт операций в Excel
  exportOperations: async (startDate: string, endDate: string, materialId?: string) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    if (materialId) params.append('material_id', materialId);

    const response = await api.get(`/materials/export/operations?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Импорт материалов из Excel
  importMaterials: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<any>>('/materials/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Получить отчет по движению материалов
  getMaterialMovementReport: async (materialId: string, startDate: string, endDate: string) => {
    const response = await api.get<ApiResponse<any>>(`/materials/${materialId}/movement-report`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Получить ABC анализ материалов
  getABCAnalysis: async (period?: string) => {
    const params = period ? `?period=${period}` : '';
    const response = await api.get<ApiResponse<any>>(`/materials/analysis/abc${params}`);
    return response.data;
  },

  // Получить материалы с низкими остатками
  getLowStockMaterials: async () => {
    const response = await api.get<ApiResponse<Material[]>>('/materials/low-stock');
    return response.data;
  },

  // Обновить минимальные остатки
  updateMinStock: async (materialId: string, minStock: number) => {
    const response = await api.patch<ApiResponse<Material>>(`/materials/${materialId}/min-stock`, { min_stock: minStock });
    return response.data;
  },
};