import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../config/logger.js';

export async function enforceProjectOwnership(req: Request, _res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(AppError.unauthorized('Authentication required'));

  // Admin bypasses ownership checks
  if (user.role === UserRole.ADMIN) {
    return next();
  }

  const projectId = req.params.id || req.params.projectId;
  if (!projectId) {
    return next(AppError.badRequest('Project ID required'));
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: { assignedDeveloperId: true },
        },
      },
    });

    if (!project) {
      return next(AppError.notFound('Project not found'));
    }

    if (user.role === UserRole.PROJECT_MANAGER) {
      if (project.createdById !== user.sub) {
        logger.warn(`Forbidden PM project access: PM ${user.sub} attempted to access Project ${projectId} owned by ${project.createdById}`);
        return next(AppError.forbidden('You can only access projects you created'));
      }
      return next();
    }

    if (user.role === UserRole.DEVELOPER) {
      // Developers can ONLY view project details if assigned to a task inside it, and NEVER mutate
      const isReadMethod = req.method === 'GET';
      const isAssigned = project.tasks.some((t) => t.assignedDeveloperId === user.sub);

      if (!isReadMethod || !isAssigned) {
        logger.warn(`Forbidden Developer project access: Dev ${user.sub} attempted ${req.method} on Project ${projectId}`);
        return next(AppError.forbidden('You do not have permission to access this project'));
      }
      return next();
    }

    return next(AppError.forbidden());
  } catch (error) {
    next(error);
  }
}

export async function enforceTaskAccess(req: Request, _res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(AppError.unauthorized('Authentication required'));

  // Admin bypasses ownership checks
  if (user.role === UserRole.ADMIN) {
    return next();
  }

  const taskId = req.params.id || req.params.taskId;
  if (!taskId) {
    return next(AppError.badRequest('Task ID required'));
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { createdById: true },
        },
      },
    });

    if (!task) {
      return next(AppError.notFound('Task not found'));
    }

    if (user.role === UserRole.PROJECT_MANAGER) {
      if (task.project.createdById !== user.sub) {
        logger.warn(`Forbidden PM task access: PM ${user.sub} attempted accessing Task ${taskId} in foreign Project owned by ${task.project.createdById}`);
        return next(AppError.forbidden('You can only manage tasks within your own projects'));
      }
      return next();
    }

    if (user.role === UserRole.DEVELOPER) {
      if (task.assignedDeveloperId !== user.sub) {
        logger.warn(`Forbidden Developer task access: Dev ${user.sub} attempted accessing Task ${taskId} assigned to ${task.assignedDeveloperId}`);
        return next(AppError.forbidden('You can only access tasks assigned to you'));
      }
      return next();
    }

    return next(AppError.forbidden());
  } catch (error) {
    next(error);
  }
}
