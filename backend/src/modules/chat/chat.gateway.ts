import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Extract userId from query params or auth token
    const userId = client.handshake.query.userId as string;
    
    if (!userId) {
      this.logger.error('Client connection rejected: No userId provided');
      client.emit('error', { message: 'Authentication required: userId must be provided' });
      client.disconnect();
      return;
    }
    
    this.connectedUsers.set(client.id, userId);
    
    // Join user to their personal room
    client.join(`user_${userId}`);
    
    // Notify user of successful connection
    client.emit('connected', { message: 'Connected to chat service', userId });
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      
      if (!userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }
      
      // Emit typing indicator to user
      client.emit('aiTyping', { typing: true });
      
      // Send message through chat service
      const response = await this.chatService.sendMessage(userId, sendMessageDto);
      
      // Stop typing indicator
      client.emit('aiTyping', { typing: false });
      
      // Send response back to client
      client.emit('messageReceived', response);
      
      // Broadcast to user's room (for multiple devices)
      this.server.to(`user_${userId}`).emit('newMessage', response);
      
      return response;
    } catch (error) {
      this.logger.error('Error handling message:', error);
      client.emit('error', { message: 'Failed to send message', error: error.message });
    }
  }

  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id) || 'demo-user-id';
    
    try {
      // Join session room
      client.join(`session_${data.sessionId}`);
      
      // Get session messages
      const messages = await this.chatService.getSessionMessages(data.sessionId, userId);
      
      // Send session history to client
      client.emit('sessionJoined', { sessionId: data.sessionId, messages });
      
      this.logger.log(`User ${userId} joined session ${data.sessionId}`);
    } catch (error) {
      this.logger.error('Error joining session:', error);
      client.emit('error', { message: 'Failed to join session', error: error.message });
    }
  }

  @SubscribeMessage('leaveSession')
  async handleLeaveSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`session_${data.sessionId}`);
    client.emit('sessionLeft', { sessionId: data.sessionId });
  }

  @SubscribeMessage('getSessions')
  async handleGetSessions(@ConnectedSocket() client: Socket) {
    const userId = this.connectedUsers.get(client.id) || 'demo-user-id';
    
    try {
      const sessions = await this.chatService.getUserSessions(userId);
      client.emit('sessionsReceived', sessions);
    } catch (error) {
      this.logger.error('Error getting sessions:', error);
      client.emit('error', { message: 'Failed to get sessions', error: error.message });
    }
  }

  @SubscribeMessage('deleteSession')
  async handleDeleteSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id) || 'demo-user-id';
    
    try {
      await this.chatService.deleteSession(data.sessionId, userId);
      
      // Notify client
      client.emit('sessionDeleted', { sessionId: data.sessionId });
      
      // Broadcast to user's room
      this.server.to(`user_${userId}`).emit('sessionDeleted', { sessionId: data.sessionId });
      
      this.logger.log(`Session ${data.sessionId} deleted by user ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting session:', error);
      client.emit('error', { message: 'Failed to delete session', error: error.message });
    }
  }

  // Helper method to send notifications to specific users
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  // Helper method to broadcast system messages
  broadcastSystemMessage(message: string) {
    this.server.emit('systemMessage', { message, timestamp: new Date() });
  }
}