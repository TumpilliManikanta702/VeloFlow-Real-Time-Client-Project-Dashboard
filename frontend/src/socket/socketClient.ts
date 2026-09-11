import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket | null {
  if (!socket && token) {
    socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinSocketRoom(room: string) {
  if (socket && socket.connected) {
    socket.emit('join_room', { room }, (res: { success: boolean; error?: string }) => {
      if (!res.success) {
        console.warn(`Failed to join room ${room}:`, res.error);
      }
    });
  }
}

export function leaveSocketRoom(room: string) {
  if (socket && socket.connected) {
    socket.emit('leave_room', { room });
  }
}
