import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { socketAuthMiddleware } from './socketAuth.js';
import { authorizeAndJoinRoom } from './roomManager.js';
import { presenceManager } from './presence.js';
import { setSocketServer } from './eventEmitter.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types.js';

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  setSocketServer(io);
  presenceManager.setIo(io);

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${socket.id} (User: ${user.sub}, Role: ${user.role})`);

    await socket.join(`user:${user.sub}`);

    if (user.role === 'ADMIN') {
      await socket.join('global:admin');
      await socket.join('global:activity');
    }

    await presenceManager.handleConnect(user.sub, socket.id, user.name);

    socket.on('join_room', async ({ room }, callback) => {
      const result = await authorizeAndJoinRoom(socket, room);
      if (callback) {
        callback(result);
      }
    });

    socket.on('leave_room', ({ room }) => {
      socket.leave(room);
    });

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${user.sub})`);
      await presenceManager.handleDisconnect(user.sub, socket.id, user.name);
    });
  });

  return io;
}
