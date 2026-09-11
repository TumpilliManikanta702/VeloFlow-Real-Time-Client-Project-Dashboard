import { Prisma, TaskPriority, TaskStatus, UserRole, NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { AccessTokenPayload } from '../utils/tokens.js';
import {
  emitTaskStatusChanged,
  emitTaskCreated,
  emitTaskUpdated,
  emitActivityCreated,
  emitNotification,
} from '../socket/eventEmitter.js';

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  from?: string;
  to?: string;
  projectId?: string;
  assignedDeveloperId?: string;
  page?: number;
  limit?: number;
}

export class TaskService {
  static async listTasks(user: AccessTokenPayload, filters: TaskFilterParams) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const where: Prisma.TaskWhereInput = {};

    if (user.role === UserRole.DEVELOPER) {
      where.assignedDeveloperId = user.sub;
    } else if (user.role === UserRole.PROJECT_MANAGER) {
      where.project = { createdById: user.sub };
      if (filters.assignedDeveloperId) {
        where.assignedDeveloperId = filters.assignedDeveloperId;
      }
    } else if (user.role === UserRole.ADMIN) {
      if (filters.assignedDeveloperId) {
        where.assignedDeveloperId = filters.assignedDeveloperId;
      }
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.from || filters.to) {
      where.dueDate = {};
      if (filters.from) where.dueDate.gte = new Date(filters.from);
      if (filters.to) where.dueDate.lte = new Date(filters.to);
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          project: {
            select: { id: true, name: true, createdById: true },
          },
          assignedDeveloper: {
            select: { id: true, name: true, email: true, isOnline: true },
          },
        },
      }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTaskById(taskId: string, user: AccessTokenPayload) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true, createdById: true },
        },
        assignedDeveloper: {
          select: { id: true, name: true, email: true, isOnline: true },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (user.role === UserRole.DEVELOPER && task.assignedDeveloperId !== user.sub) {
      throw AppError.forbidden('You can only view tasks assigned to you');
    }

    if (user.role === UserRole.PROJECT_MANAGER && task.project.createdById !== user.sub) {
      throw AppError.forbidden('You can only view tasks in projects you created');
    }

    return task;
  }

  static async createTask(
    data: {
      projectId: string;
      title: string;
      description: string;
      assignedDeveloperId?: string | null;
      priority: TaskPriority;
      dueDate: string;
    },
    user: AccessTokenPayload
  ) {
    if (user.role === UserRole.DEVELOPER) {
      throw AppError.forbidden('Developers cannot create tasks');
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw AppError.notFound('Project not found');
    }

    if (user.role === UserRole.PROJECT_MANAGER && project.createdById !== user.sub) {
      throw AppError.forbidden('You can only create tasks in projects you created');
    }

    if (data.assignedDeveloperId) {
      const dev = await prisma.user.findUnique({ where: { id: data.assignedDeveloperId } });
      if (!dev || dev.role !== UserRole.DEVELOPER) {
        throw AppError.badRequest('Assigned user must be an existing developer');
      }
    }

    const dueDateObj = new Date(data.dueDate);
    const isOverdue = dueDateObj < new Date();

    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        assignedDeveloperId: data.assignedDeveloperId || null,
        priority: data.priority,
        dueDate: dueDateObj,
        isOverdue,
        status: TaskStatus.TODO,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
    });

    const actLog = await prisma.activityLog.create({
      data: {
        projectId: project.id,
        taskId: task.id,
        userId: user.sub,
        action: 'TASK_CREATED',
        newStatus: TaskStatus.TODO,
        metadata: { taskTitle: task.title, creatorName: user.name },
      },
    });

    emitTaskCreated({
      taskId: task.id,
      projectId: task.projectId,
      title: task.title,
      priority: task.priority,
      status: task.status,
      assignedDeveloperId: task.assignedDeveloperId,
    });

    emitActivityCreated({
      id: actLog.id,
      projectId: actLog.projectId,
      projectOwnerId: project.createdById,
      assignedDeveloperId: task.assignedDeveloperId,
      taskId: actLog.taskId,
      taskTitle: task.title,
      userId: user.sub,
      userName: user.name,
      action: actLog.action,
      oldStatus: actLog.oldStatus,
      newStatus: actLog.newStatus,
      metadata: actLog.metadata,
      createdAt: actLog.createdAt.toISOString(),
    });

    if (task.assignedDeveloperId) {
      const notif = await prisma.notification.create({
        data: {
          recipientId: task.assignedDeveloperId,
          taskId: task.id,
          projectId: task.projectId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task Assignment',
          message: `You were assigned Task: "${task.title}" in ${task.project.name}`,
        },
      });

      const unreadCount = await prisma.notification.count({
        where: { recipientId: task.assignedDeveloperId, isRead: false },
      });

      emitNotification(task.assignedDeveloperId, notif, unreadCount);
    }

    return task;
  }

  static async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      assignedDeveloperId?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
    },
    user: AccessTokenPayload
  ) {
    if (user.role === UserRole.DEVELOPER) {
      throw AppError.forbidden('Developers cannot modify general task settings');
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (user.role === UserRole.PROJECT_MANAGER && task.project.createdById !== user.sub) {
      throw AppError.forbidden('You can only update tasks in projects you created');
    }

    const oldAssignedDev = task.assignedDeveloperId;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.assignedDeveloperId !== undefined ? { assignedDeveloperId: data.assignedDeveloperId } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
        ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
    });

    emitTaskUpdated({
      taskId: updatedTask.id,
      projectId: updatedTask.projectId,
      title: updatedTask.title,
      priority: updatedTask.priority,
      status: updatedTask.status,
      assignedDeveloperId: updatedTask.assignedDeveloperId,
    });

    if (data.assignedDeveloperId && data.assignedDeveloperId !== oldAssignedDev) {
      const notif = await prisma.notification.create({
        data: {
          recipientId: data.assignedDeveloperId,
          taskId: updatedTask.id,
          projectId: updatedTask.projectId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'Task Reassigned to You',
          message: `You were assigned Task: "${updatedTask.title}" in ${updatedTask.project.name}`,
        },
      });

      const unreadCount = await prisma.notification.count({
        where: { recipientId: data.assignedDeveloperId, isRead: false },
      });

      emitNotification(data.assignedDeveloperId, notif, unreadCount);
    }

    return updatedTask;
  }

  static async updateTaskStatus(taskId: string, newStatus: TaskStatus, user: AccessTokenPayload) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true, createdById: true },
        },
        assignedDeveloper: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (user.role === UserRole.DEVELOPER) {
      if (task.assignedDeveloperId !== user.sub) {
        throw AppError.forbidden('You can only update the status of tasks assigned to you');
      }
    } else if (user.role === UserRole.PROJECT_MANAGER) {
      if (task.project.createdById !== user.sub) {
        throw AppError.forbidden('You can only update tasks in projects you created');
      }
    }

    const oldStatus = task.status;
    if (oldStatus === newStatus) {
      return task;
    }

    // Persist status change, activity history, and notifications atomically
    const { updatedTask, activityLog, notification } = await prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          ...(newStatus === TaskStatus.DONE ? { isOverdue: false } : {}),
        },
        include: {
          project: { select: { id: true, name: true, createdById: true } },
          assignedDeveloper: { select: { id: true, name: true, email: true } },
        },
      });

      const log = await tx.activityLog.create({
        data: {
          projectId: task.projectId,
          taskId: task.id,
          userId: user.sub,
          action: 'STATUS_CHANGED',
          oldStatus,
          newStatus,
          metadata: {
            taskTitle: task.title,
            userName: user.name,
          },
        },
      });

      let notif = null;
      if (newStatus === TaskStatus.IN_REVIEW) {
        notif = await tx.notification.create({
          data: {
            recipientId: task.project.createdById,
            taskId: task.id,
            projectId: task.projectId,
            type: NotificationType.TASK_IN_REVIEW,
            title: 'Task Submitted for Review',
            message: `${user.name} moved "${task.title}" to In Review in ${task.project.name}`,
          },
        });
      }

      return { updatedTask: updated, activityLog: log, notification: notif };
    });

    // Real-time events are dispatched only after successful transaction commit
    emitTaskStatusChanged({
      taskId: updatedTask.id,
      projectId: updatedTask.projectId,
      taskTitle: updatedTask.title,
      oldStatus,
      newStatus,
      updatedById: user.sub,
      updatedByName: user.name,
      assignedDeveloperId: updatedTask.assignedDeveloperId,
      updatedAt: updatedTask.updatedAt.toISOString(),
    });

    emitActivityCreated({
      id: activityLog.id,
      projectId: activityLog.projectId,
      projectOwnerId: updatedTask.project.createdById,
      assignedDeveloperId: updatedTask.assignedDeveloperId,
      taskId: activityLog.taskId,
      taskTitle: task.title,
      userId: user.sub,
      userName: user.name,
      action: activityLog.action,
      oldStatus: activityLog.oldStatus,
      newStatus: activityLog.newStatus,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt.toISOString(),
    });

    if (notification) {
      const pmUnread = await prisma.notification.count({
        where: { recipientId: notification.recipientId, isRead: false },
      });
      emitNotification(notification.recipientId, notification, pmUnread);
    }

    return updatedTask;
  }
}
