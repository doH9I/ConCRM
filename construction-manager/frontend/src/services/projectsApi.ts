import api from './api';
import { Project, CreateProjectForm, ProjectFilters, ApiResponse } from '../types';

export const projectsApi = {
  // Получить все проекты с фильтрами
  getProjects: async (filters: ProjectFilters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get<ApiResponse<Project[]>>(`/projects?${params}`);
    return response.data;
  },

  // Получить проект по ID
  getProject: async (id: string) => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  // Создать новый проект
  createProject: async (projectData: CreateProjectForm) => {
    const response = await api.post<ApiResponse<Project>>('/projects', projectData);
    return response.data;
  },

  // Обновить проект
  updateProject: async (id: string, projectData: Partial<CreateProjectForm>) => {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, projectData);
    return response.data;
  },

  // Удалить проект
  deleteProject: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data;
  },

  // Получить статистику проекта
  getProjectStats: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/projects/${id}/stats`);
    return response.data;
  },

  // Получить этапы проекта
  getProjectStages: async (projectId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/projects/${projectId}/stages`);
    return response.data;
  },

  // Создать этап проекта
  createProjectStage: async (projectId: string, stageData: any) => {
    const response = await api.post<ApiResponse<any>>(`/projects/${projectId}/stages`, stageData);
    return response.data;
  },

  // Обновить этап проекта
  updateProjectStage: async (projectId: string, stageId: string, stageData: any) => {
    const response = await api.put<ApiResponse<any>>(`/projects/${projectId}/stages/${stageId}`, stageData);
    return response.data;
  },

  // Удалить этап проекта
  deleteProjectStage: async (projectId: string, stageId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/projects/${projectId}/stages/${stageId}`);
    return response.data;
  },
};