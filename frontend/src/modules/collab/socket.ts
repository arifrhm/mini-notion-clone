import { io, Socket } from 'socket.io-client';
import { apiConfig } from '@shared/config/api.config';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${apiConfig.baseURL}/collab`, {
      withCredentials: true,
      transports: ['websocket'],
    });
  }
  return socket;
}