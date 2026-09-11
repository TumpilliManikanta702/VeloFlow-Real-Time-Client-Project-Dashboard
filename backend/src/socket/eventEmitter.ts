import { Server } from 'socket.io';
import {
  ActivityPayload,
  ClientToServerEvents,
  NotificationPayload,
  ServerToClientEvents,
  SocketData,
  TaskCreatedPayload,
  TaskStatusChangedPayload,
  TaskUpdatedPayload,
} from './types.js';
import { logger } from '../config/logger.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

let ioInstance: AppServer | null = null;

export function setSocketServer(io: AppServer) {
  ioInstance = io;
}

export function emitTaskStatusChanged(payload: TaskStatusChangedPayload) {
  if (!ioInstance) return;

  logger.info(`Emitting task:status_changed for task ${payload.taskId} (${payload.oldStatus} -> ${payload.newStatus})`);

  ioInstance.to(`project:${payload.projectId}`).emit('task:status_changed', payload);
  ioInstance.to('global:admin').emit('task:status_changed', payload);

  if (payload.assignedDeveloperId) {
    ioInstance.to(`user:${payload.assignedDeveloperId}`).emit('task:status_changed', payload);
  }
}

export function emitTaskCreated(payload: TaskCreatedPayload) {
  if (!ioInstance) return;

  ioInstance.to(`project:${payload.projectId}`).emit('task:created', payload);
  ioInstance.to('global:admin').emit('task:created', payload);

  if (payload.assignedDeveloperId) {
    ioInstance.to(`user:${payload.assignedDeveloperId}`).emit('task:created', payload);
  }
}

export function emitTaskUpdated(payload: TaskUpdatedPayload) {
  if (!ioInstance) return;

  ioInstance.to(`project:${payload.projectId}`).emit('task:updated', payload);
  ioInstance.to('global:admin').emit('task:updated', payload);

  if (payload.assignedDeveloperId) {
    ioInstance.to(`user:${payload.assignedDeveloperId}`).emit('task:updated', payload);
  }
}

export function emitActivityCreated(payload: ActivityPayload) {
  if (!ioInstance) return;

  logger.info(`Emitting activity:new for project ${payload.projectId} (Owner: ${payload.projectOwnerId || 'none'}, Dev: ${payload.assignedDeveloperId || 'none'})`);
  ioInstance.to(`project:${payload.projectId}`).emit('activity:new', payload);
  ioInstance.to('global:admin').emit('activity:new', payload);

  if (payload.projectOwnerId) {
    ioInstance.to(`user:${payload.projectOwnerId}`).emit('activity:new', payload);
  }

  if (payload.assignedDeveloperId) {
    ioInstance.to(`user:${payload.assignedDeveloperId}`).emit('activity:new', payload);
  }
}

export function emitNotification(recipientId: string, payload: NotificationPayload, unreadCount: number) {
  if (!ioInstance) return;

  logger.info(`Emitting notification:new to user:${recipientId}`);
  ioInstance.to(`user:${recipientId}`).emit('notification:new', payload);
  ioInstance.to(`user:${recipientId}`).emit('notification:count_updated', { unreadCount });
}

export function emitUnreadCount(recipientId: string, unreadCount: number) {
  if (!ioInstance) return;

  logger.info(`Emitting notification:count_updated (${unreadCount}) to user:${recipientId}`);
  ioInstance.to(`user:${recipientId}`).emit('notification:count_updated', { unreadCount });
}
