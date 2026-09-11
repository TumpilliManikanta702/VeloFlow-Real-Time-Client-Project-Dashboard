export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NotificationType = 'TASK_ASSIGNED' | 'TASK_IN_REVIEW' | 'TASK_STATUS_CHANGED' | 'TASK_OVERDUE' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOnline: boolean;
  lastSeenAt: string | null;
  createdAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  createdAt: string;
  projects?: Project[];
  _count?: { projects: number };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; companyName: string; email: string };
  createdBy?: { id: string; name: string; email: string };
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedDeveloperId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; createdById: string };
  assignedDeveloper?: { id: string; name: string; email: string; isOnline?: boolean } | null;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId: string | null;
  userId: string;
  action: string;
  oldStatus: TaskStatus | null;
  newStatus: TaskStatus | null;
  metadata?: { taskTitle?: string; userName?: string } | null;
  createdAt: string;
  user?: { id: string; name: string; email?: string };
  project?: { id: string; name: string };
  task?: { id: string; title: string };
}

export interface Notification {
  id: string;
  recipientId: string;
  taskId: string | null;
  projectId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount?: number;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
