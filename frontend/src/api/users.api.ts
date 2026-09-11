import { apiClient } from './client.js';
import { ApiResponse, User, UserRole } from '../types/index.js';

export const usersApi = {
  list: async (role?: UserRole) => {
    const url = role ? `/users?role=${role}` : '/users';
    const res = await apiClient.get<ApiResponse<User[]>>(url);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },

  update: async (id: string, data: Partial<{ name: string; email: string; password?: string; role?: UserRole }>) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/users/${id}`);
    return res.data;
  },

  register: async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const res = await apiClient.post<ApiResponse<User>>('/auth/register', data);
    return res.data;
  },
};
