/**
 * WebSocket Gateway for real-time notifications (likes, comments, etc.).
 * Uses Socket.IO with Redis adapter for horizontal scaling.
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  // Method to emit events (can be called from services)
  emitPostLiked(postId: string, userId: string) {
    this.server.to(`post:${postId}`).emit('post-liked', { postId, userId });
  }

  emitPostCreated(post: any) {
    this.server.emit('post-created', post);
  }

  emitPostUpdated(postId: string, post: any) {
    this.server.to(`post:${postId}`).emit('post-updated', post);
  }

  emitPostDeleted(postId: string) {
    this.server.emit('post-deleted', { postId });
  }
}

