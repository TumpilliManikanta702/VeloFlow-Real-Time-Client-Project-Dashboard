import { apiClient } from './client.js';
import { ApiResponse, Project } from '../types/index.js';

export const projectsApi = {
  list: async (page = 1, limit = 20) => {
    const res = await apiClient.get<ApiResponse<Project[]>>(`/projects?page=${page}&limit=${limit}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data;
  },

  create: async (data: { name: string; description: string; clientId: string }) => {
    const res = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return res.data;
  },

  update: async (id: string, data: Partial<{ name: string; description: string; clientId: string }>) => {
    const res = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/projects/${id}`);
    return res.data;
  },
};
