import { apiClient } from './client.js';
import { ApiResponse, User } from '../types/index.js';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', credentials);
    return res.data;
  },

  refresh: async () => {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/refresh');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
