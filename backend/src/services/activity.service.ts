import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AccessTokenPayload } from '../utils/tokens.js';

export class ActivityService {
  private static buildWhereClause(user: AccessTokenPayload, projectId?: string): Prisma.ActivityLogWhereInput {
    const where: Prisma.ActivityLogWhereInput = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (user.role === UserRole.ADMIN) {
      // Admin receives global activities
      return where;
    }

    if (user.role === UserRole.PROJECT_MANAGER) {
      // PM receives activity only from projects they created
      where.project = { createdById: user.sub };
      return where;
    }

    if (user.role === UserRole.DEVELOPER) {
      // Developer receives activity only for tasks assigned to them
      where.task = { assignedDeveloperId: user.sub };
      return where;
    }

    return where;
  }

  static async listActivity(user: AccessTokenPayload, page = 1, limit = 20, projectId?: string) {
    const where = this.buildWhereClause(user, projectId);

    const [total, activities] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Returns recent role-scoped activities from PostgreSQL for clients reconnecting after downtime
  static async getRecentActivities(user: AccessTokenPayload) {
    const where = this.buildWhereClause(user);

    const activities = await prisma.activityLog.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    return activities;
  }
}
