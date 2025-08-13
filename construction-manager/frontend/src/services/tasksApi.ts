import api from './api';
import { Task, CreateTaskForm, TaskFilters, ApiResponse } from '../types';

export const tasksApi = {
  // Получить все задачи с фильтрами
  getTasks: async (filters: TaskFilters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Добавляем фильтры в параметры запроса
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params}`);
    return response.data;
  },

  // Получить задачу по ID
  getTask: async (id: string) => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  // Создать новую задачу
  createTask: async (taskData: CreateTaskForm) => {
    const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
    return response.data;
  },

  // Обновить задачу
  updateTask: async (id: string, taskData: Partial<CreateTaskForm>) => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Удалить задачу
  deleteTask: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${id}`);
    return response.data;
  },

  // Обновить статус задачи
  updateTaskStatus: async (id: string, status: string) => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Назначить задачу пользователю
  assignTask: async (id: string, assignedTo: string) => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/assign`, { assigned_to: assignedTo });
    return response.data;
  },

  // Добавить комментарий к задаче
  addTaskComment: async (taskId: string, content: string) => {
    const response = await api.post<ApiResponse<any>>(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  // Получить комментарии задачи
  getTaskComments: async (taskId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  // Добавить время выполнения
  addTimeEntry: async (taskId: string, hours: number, description?: string) => {
    const response = await api.post<ApiResponse<any>>(`/tasks/${taskId}/time`, { 
      hours, 
      description,
      date: new Date().toISOString().split('T')[0]
    });
    return response.data;
  },

  // Получить записи времени для задачи
  getTaskTimeEntries: async (taskId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/tasks/${taskId}/time`);
    return response.data;
  },
};