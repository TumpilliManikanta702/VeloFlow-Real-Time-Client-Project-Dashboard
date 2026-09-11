import { Server } from 'socket.io';
import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

class PresenceManager {
  // Map of userId -> Set of active socket IDs (handles multiple tabs/devices)
  private userSockets: Map<string, Set<string>> = new Map();
  private io: AppServer | null = null;

  public setIo(io: AppServer) {
    this.io = io;
  }

  public async handleConnect(userId: string, socketId: string, userName: string) {
    let sockets = this.userSockets.get(userId);
    const isFirstConnection = !sockets || sockets.size === 0;

    if (!sockets) {
      sockets = new Set<string>();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socketId);

    if (isFirstConnection) {
      logger.info(`User ${userId} (${userName}) came online. Total active sessions: ${this.getActiveUserCount()}`);
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: true, lastSeenAt: new Date() },
        });
      } catch (err) {
        logger.error(`Failed to update DB online status for user ${userId}: ${(err as Error).message}`);
      }

      this.broadcastPresence(userId, userName, true, null);
    }
  }

  public async handleDisconnect(userId: string, socketId: string, userName: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      const lastSeenAt = new Date();
      logger.info(`User ${userId} (${userName}) went offline. Total active sessions: ${this.getActiveUserCount()}`);

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeenAt },
        });
      } catch (err) {
        logger.error(`Failed to update DB offline status for user ${userId}: ${(err as Error).message}`);
      }

      this.broadcastPresence(userId, userName, false, lastSeenAt.toISOString());
    }
  }

  public getActiveUserCount(): number {
    return this.userSockets.size;
  }

  public isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return Boolean(sockets && sockets.size > 0);
  }

  private broadcastPresence(userId: string, name: string, isOnline: boolean, lastSeenAt: string | null) {
    if (!this.io) return;

    const payload = {
      userId,
      name,
      isOnline,
      lastSeenAt,
      activeCount: this.getActiveUserCount(),
    };

    // Broadcast presence update to admin and user's private channel
    this.io.to('global:admin').emit('presence:update', payload);
  }
}

export const presenceManager = new PresenceManager();
