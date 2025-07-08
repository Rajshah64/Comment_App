import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  constructor() {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from auth header or query
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.warn('WebSocket connection rejected: No token provided');
        client.disconnect();
        return;
      }

      // Verify token with Supabase
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
      );

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        this.logger.warn('WebSocket connection rejected: Invalid token');
        client.disconnect();
        return;
      }

      // Store user-socket mapping
      const userId = user.id;
      const socketIds = this.userSockets.get(userId) || [];
      socketIds.push(client.id);
      this.userSockets.set(userId, socketIds);

      // Join user to their personal room
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} connected via WebSocket (${client.id})`);

      // Send connection confirmation
      client.emit('connected', { userId });
    } catch (error) {
      this.logger.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove socket from user mapping
    for (const [userId, socketIds] of this.userSockets.entries()) {
      const index = socketIds.indexOf(client.id);
      if (index !== -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, socketIds);
        }
        this.logger.log(
          `User ${userId} disconnected from WebSocket (${client.id})`,
        );
        break;
      }
    }
  }

  // Method to emit notification to specific user
  emitNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('newNotification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  // Method to emit notification update to specific user
  emitNotificationUpdateToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notificationUpdated', notification);
    this.logger.log(`Notification update sent to user ${userId}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong');
  }
}
