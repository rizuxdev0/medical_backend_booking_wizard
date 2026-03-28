import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  @ApiOperation({ summary: 'Get conversations or direct messages' })
  async getMessages(
    @Query('user_id') userId: string,
    @Query('partner_id') partnerId?: string,
  ) {
    if (!userId) {
      return [];
    }
    
    if (partnerId) {
      // Get messages between two users
      return this.chatService.getMessages(userId, partnerId);
    } else {
      // Get all recent messages for the user (to build conversations list)
      return this.chatService.getConversations(userId);
    }
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(@Body() body: any) {
    const recipientId = body.recipient_id || body.receiver_id;
    return this.chatService.saveMessage(body.sender_id, body.content, body.room_id, recipientId);
  }

  @Patch('messages/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  async markRead(@Body() body: any) {
    const recipientId = body.recipient_id || body.receiver_id;
    return this.chatService.markMessagesAsRead(body.sender_id, recipientId);
  }
}
