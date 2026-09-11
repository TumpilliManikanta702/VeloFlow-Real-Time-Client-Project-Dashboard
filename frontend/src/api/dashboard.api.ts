import { apiClient } from './client.js';
import { ApiResponse, Project, Task, ActivityLog, User } from '../types/index.js';

export interface AdminDashboardData {
  kpis: {
    totalProjects: number;
    totalTasks: number;
    overdueTasks: number;
    activeUsersCount: number;
  };
  statusBreakdown: Record<string, number>;
  activeUsers: User[];
  recentActivities: ActivityLog[];
}

export interface ManagerDashboardData {
  kpis: {
    totalProjects: number;
    totalTasks: number;
    overdueTasks: number;
  };
  myProjects: Project[];
  priorityBreakdown: Record<string, number>;
  upcomingTasks: Task[];
  recentActivities: ActivityLog[];
}

export interface DeveloperDashboardData {
  kpis: {
    totalAssigned: number;
    inProgress: number;
    inReview: number;
    done: number;
    unreadNotifications: number;
  };
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  assignedTasks: Task[];
  upcomingDeadlines: Task[];
  recentActivities: ActivityLog[];
}

export const dashboardApi = {
  getAdmin: async () => {
    const res = await apiClient.get<ApiResponse<AdminDashboardData>>('/dashboard/admin');
    return res.data;
  },

  getManager: async () => {
    const res = await apiClient.get<ApiResponse<ManagerDashboardData>>('/dashboard/manager');
    return res.data;
  },

  getDeveloper: async () => {
    const res = await apiClient.get<ApiResponse<DeveloperDashboardData>>('/dashboard/developer');
    return res.data;
  },
};
