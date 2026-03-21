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
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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
      
      // Join general room
      client.join('general');
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[CHAT] Client disconnected`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { room_id: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const msg = await this.chatService.saveMessage(userId, data.content, data.room_id);
    
    // Broadcast to the room
    this.server.to(data.room_id || 'general').emit('newMessage', msg);
    return msg;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    return { success: true };
  }
}
