import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get chat history' })
  async getHistory(@Query('room_id') roomId: string) {
    return this.chatService.findAll(roomId);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get active rooms' })
  async getRooms() {
    // Placeholder: In a real app we'd fetch rooms for the current user
    return [{ id: 'general', name: 'Général' }];
  }
}
