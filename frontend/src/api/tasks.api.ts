import { apiClient } from './client.js';
import { ApiResponse, Task, TaskPriority, TaskStatus } from '../types/index.js';

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  from?: string;
  to?: string;
  projectId?: string;
  assignedDeveloperId?: string;
  page?: number;
  limit?: number;
}

export const tasksApi = {
  list: async (filters: TaskFilterOptions = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.assignedDeveloperId) params.append('assignedDeveloperId', filters.assignedDeveloperId);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const res = await apiClient.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },

  create: async (data: {
    projectId: string;
    title: string;
    description: string;
    assignedDeveloperId?: string | null;
    priority: TaskPriority;
    dueDate: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Task>>('/tasks', data);
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      assignedDeveloperId: string | null;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string;
    }>
  ) => {
    const res = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: TaskStatus) => {
    const res = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return res.data;
  },
};
