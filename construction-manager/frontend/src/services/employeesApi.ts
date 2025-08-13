import api from './api';
import { Employee, CreateEmployeeForm, TimeEntry, ApiResponse } from '../types';

export const employeesApi = {
  // Получить всех сотрудников
  getEmployees: async (page = 1, limit = 20, filters: any = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get<ApiResponse<Employee[]>>(`/employees?${params}`);
    return response.data;
  },

  // Получить сотрудника по ID
  getEmployee: async (id: string) => {
    const response = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return response.data;
  },

  // Создать нового сотрудника
  createEmployee: async (employeeData: CreateEmployeeForm) => {
    const response = await api.post<ApiResponse<Employee>>('/employees', employeeData);
    return response.data;
  },

  // Обновить сотрудника
  updateEmployee: async (id: string, employeeData: Partial<CreateEmployeeForm>) => {
    const response = await api.put<ApiResponse<Employee>>(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Удалить сотрудника
  deleteEmployee: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/employees/${id}`);
    return response.data;
  },

  // Получить табель учета времени
  getTimesheet: async (employeeId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await api.get<ApiResponse<TimeEntry[]>>(`/employees/timesheet?${params}`);
    return response.data;
  },

  // Добавить запись времени
  addTimeEntry: async (timeData: {
    employee_id: string;
    project_id?: string;
    task_id?: string;
    date: string;
    hours: number;
    description?: string;
    is_overtime: boolean;
  }) => {
    const response = await api.post<ApiResponse<TimeEntry>>('/employees/timesheet', timeData);
    return response.data;
  },

  // Обновить запись времени
  updateTimeEntry: async (id: string, timeData: Partial<TimeEntry>) => {
    const response = await api.put<ApiResponse<TimeEntry>>(`/employees/timesheet/${id}`, timeData);
    return response.data;
  },

  // Удалить запись времени
  deleteTimeEntry: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/employees/timesheet/${id}`);
    return response.data;
  },

  // Получить зарплатный отчет
  getSalaryReport: async (employeeId: string, month: string, year: string) => {
    const response = await api.get<ApiResponse<any>>(`/employees/${employeeId}/salary-report`, {
      params: { month, year }
    });
    return response.data;
  },

  // Получить статистику сотрудника
  getEmployeeStats: async (employeeId: string, period?: string) => {
    const params = period ? `?period=${period}` : '';
    const response = await api.get<ApiResponse<any>>(`/employees/${employeeId}/stats${params}`);
    return response.data;
  },

  // Экспорт табеля в Excel
  exportTimesheet: async (startDate: string, endDate: string, employeeId?: string) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    if (employeeId) params.append('employee_id', employeeId);

    const response = await api.get(`/employees/timesheet/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Импорт сотрудников из Excel
  importEmployees: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<any>>('/employees/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};