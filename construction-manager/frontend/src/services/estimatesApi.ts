import api from './api';
import { Estimate, EstimateItem, CreateEstimateForm, ApiResponse } from '../types';

export const estimatesApi = {
  // Получить все сметы
  getEstimates: async (page = 1, limit = 20, filters: any = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get<ApiResponse<Estimate[]>>(`/estimates?${params}`);
    return response.data;
  },

  // Получить смету по ID
  getEstimate: async (id: string) => {
    const response = await api.get<ApiResponse<Estimate>>(`/estimates/${id}`);
    return response.data;
  },

  // Создать новую смету
  createEstimate: async (estimateData: CreateEstimateForm) => {
    const response = await api.post<ApiResponse<Estimate>>('/estimates', estimateData);
    return response.data;
  },

  // Обновить смету
  updateEstimate: async (id: string, estimateData: Partial<CreateEstimateForm>) => {
    const response = await api.put<ApiResponse<Estimate>>(`/estimates/${id}`, estimateData);
    return response.data;
  },

  // Удалить смету
  deleteEstimate: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/estimates/${id}`);
    return response.data;
  },

  // Копировать смету
  copyEstimate: async (id: string, newName: string) => {
    const response = await api.post<ApiResponse<Estimate>>(`/estimates/${id}/copy`, { name: newName });
    return response.data;
  },

  // Получить позиции сметы
  getEstimateItems: async (estimateId: string) => {
    const response = await api.get<ApiResponse<EstimateItem[]>>(`/estimates/${estimateId}/items`);
    return response.data;
  },

  // Добавить позицию в смету
  addEstimateItem: async (estimateId: string, itemData: {
    name: string;
    description?: string;
    unit: string;
    quantity: number;
    unit_price: number;
    material_id?: string;
    category?: string;
  }) => {
    const response = await api.post<ApiResponse<EstimateItem>>(`/estimates/${estimateId}/items`, itemData);
    return response.data;
  },

  // Обновить позицию сметы
  updateEstimateItem: async (estimateId: string, itemId: string, itemData: Partial<EstimateItem>) => {
    const response = await api.put<ApiResponse<EstimateItem>>(`/estimates/${estimateId}/items/${itemId}`, itemData);
    return response.data;
  },

  // Удалить позицию сметы
  deleteEstimateItem: async (estimateId: string, itemId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/estimates/${estimateId}/items/${itemId}`);
    return response.data;
  },

  // Импорт сметы из Excel
  importEstimate: async (file: File, projectId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('project_id', projectId);

    const response = await api.post<ApiResponse<Estimate>>('/estimates/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Экспорт сметы в Excel
  exportEstimate: async (estimateId: string, format: 'excel' | 'pdf' = 'excel') => {
    const response = await api.get(`/estimates/${estimateId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Получить шаблоны смет
  getEstimateTemplates: async () => {
    const response = await api.get<ApiResponse<Estimate[]>>('/estimates/templates');
    return response.data;
  },

  // Создать смету из шаблона
  createFromTemplate: async (templateId: string, estimateData: {
    name: string;
    project_id?: string;
    description?: string;
  }) => {
    const response = await api.post<ApiResponse<Estimate>>(`/estimates/templates/${templateId}/create`, estimateData);
    return response.data;
  },

  // Сохранить смету как шаблон
  saveAsTemplate: async (estimateId: string, templateName: string) => {
    const response = await api.post<ApiResponse<Estimate>>(`/estimates/${estimateId}/save-template`, { 
      name: templateName 
    });
    return response.data;
  },

  // Пересчитать смету (обновить итоги)
  recalculateEstimate: async (estimateId: string) => {
    const response = await api.post<ApiResponse<Estimate>>(`/estimates/${estimateId}/recalculate`);
    return response.data;
  },

  // Применить коэффициенты к смете
  applyCoefficients: async (estimateId: string, coefficients: {
    overhead?: number;
    profit?: number;
    vat?: number;
    regional?: number;
  }) => {
    const response = await api.post<ApiResponse<Estimate>>(`/estimates/${estimateId}/coefficients`, coefficients);
    return response.data;
  },

  // Сравнить сметы
  compareEstimates: async (estimateId1: string, estimateId2: string) => {
    const response = await api.get<ApiResponse<any>>('/estimates/compare', {
      params: { estimate1: estimateId1, estimate2: estimateId2 }
    });
    return response.data;
  },

  // Получить анализ сметы
  getEstimateAnalysis: async (estimateId: string) => {
    const response = await api.get<ApiResponse<any>>(`/estimates/${estimateId}/analysis`);
    return response.data;
  },

  // Обновить статус сметы
  updateEstimateStatus: async (estimateId: string, status: string) => {
    const response = await api.patch<ApiResponse<Estimate>>(`/estimates/${estimateId}/status`, { status });
    return response.data;
  },

  // Получить историю изменений сметы
  getEstimateHistory: async (estimateId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/estimates/${estimateId}/history`);
    return response.data;
  },
};