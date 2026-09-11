import { apiClient } from './client.js';
import { ApiResponse, Client } from '../types/index.js';

export const clientsApi = {
  list: async (page = 1, limit = 50) => {
    const res = await apiClient.get<ApiResponse<Client[]>>(`/clients?page=${page}&limit=${limit}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return res.data;
  },

  create: async (data: { name: string; email: string; companyName: string }) => {
    const res = await apiClient.post<ApiResponse<Client>>('/clients', data);
    return res.data;
  },

  update: async (id: string, data: Partial<{ name: string; email: string; companyName: string }>) => {
    const res = await apiClient.patch<ApiResponse<Client>>(`/clients/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/clients/${id}`);
    return res.data;
  },
};
