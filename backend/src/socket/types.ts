import { TaskStatus, TaskPriority, NotificationType } from '@prisma/client';

export interface ServerToClientEvents {
  'task:status_changed': (payload: TaskStatusChangedPayload) => void;
  'task:created': (payload: TaskCreatedPayload) => void;
  'task:updated': (payload: TaskUpdatedPayload) => void;
  'activity:new': (payload: ActivityPayload) => void;
  'notification:new': (payload: NotificationPayload) => void;
  'notification:count_updated': (payload: { unreadCount: number }) => void;
  'presence:update': (payload: PresencePayload) => void;
}

export interface ClientToServerEvents {
  'join_room': (payload: { room: string }, callback?: (response: { success: boolean; error?: string }) => void) => void;
  'leave_room': (payload: { room: string }) => void;
}

export interface SocketData {
  user: {
    sub: string;
    email: string;
    role: string;
    name: string;
  };
}

export interface TaskStatusChangedPayload {
  taskId: string;
  projectId: string;
  taskTitle: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  updatedById: string;
  updatedByName: string;
  assignedDeveloperId: string | null;
  updatedAt: string;
}

export interface TaskCreatedPayload {
  taskId: string;
  projectId: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedDeveloperId: string | null;
}

export interface TaskUpdatedPayload {
  taskId: string;
  projectId: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedDeveloperId: string | null;
}

export interface ActivityPayload {
  id: string;
  projectId: string;
  projectOwnerId?: string;
  assignedDeveloperId?: string | null;
  taskId: string | null;
  taskTitle?: string;
  userId: string;
  userName: string;
  action: string;
  oldStatus: TaskStatus | null;
  newStatus: TaskStatus | null;
  metadata?: unknown;
  createdAt: string;
}

export interface NotificationPayload {
  id: string;
  recipientId: string;
  taskId: string | null;
  projectId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
  readAt?: string | Date | null;
}

export interface PresencePayload {
  userId: string;
  name: string;
  isOnline: boolean;
  lastSeenAt: string | null;
  activeCount: number;
}
