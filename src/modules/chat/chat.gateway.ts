import {
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) throw new UnauthorizedException();
      
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      console.log(`[CHAT] Client connected: ${payload.id}`);
      
      // Join personal room for direct messages
      client.join(payload.id);
      // Join general room
      client.join('general');

      this.onlineUsers.set(client.id, payload.id);
      this.broadcastOnlineUsers();
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineUsers();
    console.log(`[CHAT] Client disconnected`);
  }

  private broadcastOnlineUsers() {
    const users = Array.from(new Set(this.onlineUsers.values()));
    this.server.emit('onlineUsers', users);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { room_id: string; content: string; recipient_id?: string; receiver_id?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const recipientId = data.recipient_id || data.receiver_id;
    const msg = await this.chatService.saveMessage(userId, data.content, data.room_id, recipientId);
    
    if (recipientId) {
      this.server.to(recipientId).emit('newMessage', msg);
      this.server.to(userId).emit('newMessage', msg); // Send back to sender
    } else {
      this.server.to(data.room_id || 'general').emit('newMessage', msg);
    }
    return msg;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { senderId: string; recipientId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Forward the typing event to the recipient
    this.server.to(data.recipientId).emit('typing', data);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    return { success: true };
  }
}

