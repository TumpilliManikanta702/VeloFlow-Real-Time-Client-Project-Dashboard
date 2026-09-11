import { Socket } from 'socket.io';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types.js';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export async function authorizeAndJoinRoom(
  socket: AppSocket,
  room: string
): Promise<{ success: boolean; error?: string }> {
  const user = socket.data.user;
  if (!user) {
    return { success: false, error: 'Unauthenticated socket' };
  }

  if (room.startsWith('user:')) {
    const targetUserId = room.replace('user:', '');
    if (user.role !== UserRole.ADMIN && user.sub !== targetUserId) {
      logger.warn(`Unauthorized socket room attempt: User ${user.sub} tried to join ${room}`);
      return { success: false, error: 'Cannot join another user private room' };
    }
    await socket.join(room);
    return { success: true };
  }

  if (room === 'global:admin' || room === 'global:activity') {
    if (user.role !== UserRole.ADMIN) {
      logger.warn(`Unauthorized socket room attempt: Non-admin ${user.sub} (${user.role}) tried to join ${room}`);
      return { success: false, error: 'Only administrators can subscribe to global activity' };
    }
    await socket.join(room);
    return { success: true };
  }

  if (room.startsWith('project:')) {
    const projectId = room.replace('project:', '');

    if (user.role === UserRole.ADMIN) {
      await socket.join(room);
      return { success: true };
    }

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          createdById: true,
          tasks: {
            where: { assignedDeveloperId: user.sub },
            select: { id: true },
          },
        },
      });

      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      if (user.role === UserRole.PROJECT_MANAGER) {
        if (project.createdById !== user.sub) {
          logger.warn(`Unauthorized PM socket room: PM ${user.sub} tried to join foreign project room ${room}`);
          return { success: false, error: 'You can only subscribe to projects you created' };
        }
        await socket.join(room);
        return { success: true };
      }

      if (user.role === UserRole.DEVELOPER) {
        if (project.tasks.length === 0) {
          logger.warn(`Unauthorized Dev socket room: Dev ${user.sub} tried to join project room ${room} with no assigned tasks`);
          return { success: false, error: 'You can only subscribe to projects where you have assigned tasks' };
        }
        await socket.join(room);
        return { success: true };
      }
    } catch (error) {
      logger.error(`Error authorizing project room join: ${(error as Error).message}`);
      return { success: false, error: 'Internal room authorization error' };
    }
  }

  return { success: false, error: 'Unknown or unsupported room' };
}
