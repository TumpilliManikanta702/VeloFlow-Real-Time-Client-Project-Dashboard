import { apiClient } from './client.js';
import { ActivityLog, ApiResponse } from '../types/index.js';

export const activityApi = {
  list: async (page = 1, limit = 20, projectId?: string) => {
    let url = `/activity?page=${page}&limit=${limit}`;
    if (projectId) url += `&projectId=${projectId}`;
    const res = await apiClient.get<ApiResponse<ActivityLog[]>>(url);
    return res.data;
  },

  getRecent: async () => {
    const res = await apiClient.get<ApiResponse<ActivityLog[]>>('/activity/recent');
    return res.data;
  },
};
