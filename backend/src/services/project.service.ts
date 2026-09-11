import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { AccessTokenPayload } from '../utils/tokens.js';

export class ProjectService {
  static async listProjects(user: AccessTokenPayload, page = 1, limit = 20) {
    const where: Prisma.ProjectWhereInput = {};

    if (user.role === UserRole.PROJECT_MANAGER) {
      where.createdById = user.sub;
    } else if (user.role === UserRole.DEVELOPER) {
      where.tasks = {
        some: { assignedDeveloperId: user.sub },
      };
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: { id: true, name: true, companyName: true, email: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { tasks: true },
          },
        },
      }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProjectById(projectId: string, user: AccessTokenPayload) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        tasks: {
          include: {
            assignedDeveloper: {
              select: { id: true, name: true, email: true, isOnline: true },
            },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
      },
    });

    if (!project) {
      throw AppError.notFound('Project not found');
    }

    if (user.role === UserRole.PROJECT_MANAGER && project.createdById !== user.sub) {
      throw AppError.forbidden('You can only view projects you created');
    }

    if (user.role === UserRole.DEVELOPER) {
      const isAssigned = project.tasks.some((t) => t.assignedDeveloperId === user.sub);
      if (!isAssigned) {
        throw AppError.forbidden('You do not have access to this project');
      }
      // Restrict task visibility for developers to assigned items only
      project.tasks = project.tasks.filter((t) => t.assignedDeveloperId === user.sub);
    }

    return project;
  }

  static async createProject(
    data: { name: string; description: string; clientId: string },
    user: AccessTokenPayload
  ) {
    if (user.role === UserRole.DEVELOPER) {
      throw AppError.forbidden('Developers cannot create projects');
    }

    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw AppError.badRequest('Client not found');
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        clientId: data.clientId,
        createdById: user.sub,
      },
      include: {
        client: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return project;
  }

  static async updateProject(
    projectId: string,
    data: { name?: string; description?: string; clientId?: string },
    user: AccessTokenPayload
  ) {
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existing) {
      throw AppError.notFound('Project not found');
    }

    if (user.role === UserRole.PROJECT_MANAGER && existing.createdById !== user.sub) {
      throw AppError.forbidden('You can only modify projects you created');
    }

    if (user.role === UserRole.DEVELOPER) {
      throw AppError.forbidden('Developers cannot modify projects');
    }

    if (data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: data.clientId } });
      if (!client) throw AppError.badRequest('Client not found');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        client: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updated;
  }

  static async deleteProject(projectId: string, user: AccessTokenPayload) {
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existing) {
      throw AppError.notFound('Project not found');
    }

    if (user.role === UserRole.PROJECT_MANAGER && existing.createdById !== user.sub) {
      throw AppError.forbidden('You can only delete projects you created');
    }

    if (user.role === UserRole.DEVELOPER) {
      throw AppError.forbidden('Developers cannot delete projects');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { success: true };
  }
}
