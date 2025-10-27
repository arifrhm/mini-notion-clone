import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG, DEFAULT_VALUES } from '../config/env.config';
import { NotesService } from '../notes/notes.service';

interface PresenceState {
  [room: string]: Set<number>; // userIds in room
}

@WebSocketGateway({
  namespace: '/collab',
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  },
})
export class CollabGateway {
  @WebSocketServer() server: Server;

  private presence: PresenceState = {};

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notesService: NotesService,
  ) {}

  private parseCookie(cookieHeader?: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!cookieHeader) return result;
    cookieHeader.split(';').forEach((pair) => {
      const [k, v] = pair.split('=').map((x) => x.trim());
      if (k) result[k] = decodeURIComponent(v || '');
    });
    return result;
  }

  private verifySocket(socket: Socket): { userId: number } {
    const cookies = this.parseCookie(socket.handshake.headers.cookie);
    const token = cookies['access_token'];
    if (!token) {
      socket.disconnect(true);
      throw new Error('Unauthorized');
    }
    const secret = this.configService.get(ENV_CONFIG.JWT_SECRET, DEFAULT_VALUES.JWT_SECRET);
    const payload: any = this.jwtService.verify(token, { secret });
    return { userId: Number(payload.sub) };
  }

  private joinPresence(room: string, userId: number) {
    if (!this.presence[room]) this.presence[room] = new Set();
    this.presence[room].add(userId);
    this.server.to(room).emit('presence', Array.from(this.presence[room]));
  }

  private leavePresence(room: string, userId: number) {
    if (!this.presence[room]) return;
    this.presence[room].delete(userId);
    this.server.to(room).emit('presence', Array.from(this.presence[room]));
  }

  async handleConnection(socket: Socket) {
    try {
      const { userId } = this.verifySocket(socket);
      socket.data.userId = userId;
    } catch (e) {
      // disconnected in verifySocket
    }
  }

  async handleDisconnect(socket: Socket) {
    const room: string | undefined = socket.data.room;
    const userId: number | undefined = socket.data.userId;
    if (room && userId) {
      this.leavePresence(room, userId);
    }
  }

  @SubscribeMessage('note:join')
  async onJoinNote(@ConnectedSocket() socket: Socket, @MessageBody() payload: { noteId: number }) {
    const { userId } = this.verifySocket(socket);
    const noteId = Number(payload?.noteId);
    if (!noteId) return;

    // Verify user can access note
    await this.notesService.findOne(noteId, userId);

    const room = `note:${noteId}`;
    socket.join(room);
    socket.data.room = room;
    this.joinPresence(room, userId);
  }

  // Broadcast-only sync events (client emits after REST success)
  @SubscribeMessage('sync:blockCreated')
  onSyncBlockCreated(@ConnectedSocket() socket: Socket, @MessageBody() payload: { noteId: number; block: any }) {
    const room = `note:${Number(payload.noteId)}`;
    socket.to(room).emit('block:created', payload.block);
  }

  @SubscribeMessage('sync:blockUpdated')
  onSyncBlockUpdated(@ConnectedSocket() socket: Socket, @MessageBody() payload: { noteId: number; block: any }) {
    const room = `note:${Number(payload.noteId)}`;
    socket.to(room).emit('block:updated', payload.block);
  }

  @SubscribeMessage('sync:blockDeleted')
  onSyncBlockDeleted(@ConnectedSocket() socket: Socket, @MessageBody() payload: { noteId: number; blockId: number }) {
    const room = `note:${Number(payload.noteId)}`;
    socket.to(room).emit('block:deleted', { id: payload.blockId });
  }

  @SubscribeMessage('sync:blocksReordered')
  onSyncBlocksReordered(@ConnectedSocket() socket: Socket, @MessageBody() payload: { noteId: number; order: Array<{ id: number; order_index: number }> }) {
    const room = `note:${Number(payload.noteId)}`;
    socket.to(room).emit('blocks:reordered', payload.order);
  }
}