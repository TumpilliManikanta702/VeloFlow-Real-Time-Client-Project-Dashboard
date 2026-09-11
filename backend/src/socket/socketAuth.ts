import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens.js';
import { logger } from '../config/logger.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types.js';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function socketAuthMiddleware(socket: AppSocket, next: (err?: Error) => void) {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const payload = verifyAccessToken(token);
    socket.data.user = payload;
    next();
  } catch (error) {
    logger.warn(`Socket authentication failed: ${(error as Error).message}`);
    next(new Error('Invalid or expired socket token'));
  }
}
