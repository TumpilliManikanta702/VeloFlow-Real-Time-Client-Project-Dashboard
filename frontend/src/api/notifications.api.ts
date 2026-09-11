import { apiClient } from './client.js';
import { ApiResponse, Notification } from '../types/index.js';

export const notificationsApi = {
  list: async (page = 1, limit = 20) => {
    const res = await apiClient.get<ApiResponse<Notification[]>>(`/notifications?page=${page}&limit=${limit}`);
    return res.data;
  },

  markRead: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await apiClient.patch<ApiResponse<null>>('/notifications/read-all');
    return res.data;
  },
};
