import { TaskPriority, TaskStatus, UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AccessTokenPayload } from '../utils/tokens.js';
import { presenceManager } from '../socket/presence.js';

export class DashboardService {
  static async getAdminDashboard() {
    const now = new Date();

    const [
      totalProjects,
      totalTasks,
      overdueTasks,
      taskStatusCounts,
      activeUsers,
      recentActivities,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: { not: TaskStatus.DONE }, dueDate: { lt: now } } }),
      prisma.task.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.user.findMany({
        where: { isOnline: true },
        select: { id: true, name: true, email: true, role: true, lastSeenAt: true },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    const statusBreakdown: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    taskStatusCounts.forEach((s) => {
      statusBreakdown[s.status] = s._count.status;
    });

    return {
      kpis: {
        totalProjects,
        totalTasks,
        overdueTasks,
        activeUsersCount: presenceManager.getActiveUserCount() || activeUsers.length,
      },
      statusBreakdown,
      activeUsers,
      recentActivities,
    };
  }

  static async getManagerDashboard(user: AccessTokenPayload) {
    const now = new Date();
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      myProjects,
      totalTasks,
      overdueTasks,
      priorityCounts,
      upcomingTasks,
      recentActivities,
    ] = await Promise.all([
      prisma.project.findMany({
        where: { createdById: user.sub },
        include: {
          client: { select: { name: true, companyName: true } },
          _count: { select: { tasks: true } },
        },
      }),
      prisma.task.count({
        where: { project: { createdById: user.sub } },
      }),
      prisma.task.count({
        where: {
          project: { createdById: user.sub },
          status: { not: TaskStatus.DONE },
          dueDate: { lt: now },
        },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { project: { createdById: user.sub } },
        _count: { priority: true },
      }),
      prisma.task.findMany({
        where: {
          project: { createdById: user.sub },
          status: { not: TaskStatus.DONE },
          dueDate: { gte: now, lte: endOfWeek },
        },
        orderBy: { dueDate: 'asc' },
        take: 8,
        include: {
          assignedDeveloper: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.activityLog.findMany({
        where: { project: { createdById: user.sub } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    const priorityBreakdown: Record<TaskPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    priorityCounts.forEach((p) => {
      priorityBreakdown[p.priority] = p._count.priority;
    });

    return {
      kpis: {
        totalProjects: myProjects.length,
        totalTasks,
        overdueTasks,
      },
      myProjects,
      priorityBreakdown,
      upcomingTasks,
      recentActivities,
    };
  }

  static async getDeveloperDashboard(user: AccessTokenPayload) {
    const now = new Date();

    const [
      assignedTasks,
      statusCounts,
      priorityCounts,
      upcomingDeadlines,
      recentActivities,
      unreadNotificationsCount,
    ] = await Promise.all([
      prisma.task.findMany({
        where: { assignedDeveloperId: user.sub },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { assignedDeveloperId: user.sub },
        _count: { status: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { assignedDeveloperId: user.sub },
        _count: { priority: true },
      }),
      prisma.task.findMany({
        where: {
          assignedDeveloperId: user.sub,
          status: { not: TaskStatus.DONE },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.activityLog.findMany({
        where: { task: { assignedDeveloperId: user.sub } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
      prisma.notification.count({
        where: { recipientId: user.sub, isRead: false },
      }),
    ]);

    const statusBreakdown: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    statusCounts.forEach((s) => {
      statusBreakdown[s.status] = s._count.status;
    });

    const priorityBreakdown: Record<TaskPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    priorityCounts.forEach((p) => {
      priorityBreakdown[p.priority] = p._count.priority;
    });

    return {
      kpis: {
        totalAssigned: assignedTasks.length,
        inProgress: statusBreakdown.IN_PROGRESS,
        inReview: statusBreakdown.IN_REVIEW,
        done: statusBreakdown.DONE,
        unreadNotifications: unreadNotificationsCount,
      },
      statusBreakdown,
      priorityBreakdown,
      assignedTasks,
      upcomingDeadlines,
      recentActivities,
    };
  }
}
