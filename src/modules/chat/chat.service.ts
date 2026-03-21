import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepo: Repository<ChatMessage>,
  ) {}

  async findAll(roomId?: string) {
    return this.chatRepo.find({
      where: roomId ? { room_id: roomId } : {},
      order: { created_at: 'ASC' },
      take: 100,
    });
  }

  async saveMessage(senderId: string, content: string, roomId?: string, receiverId?: string) {
    const msg = this.chatRepo.create({
      sender_id: senderId,
      content,
      room_id: roomId,
      receiver_id: receiverId,
    });
    return this.chatRepo.save(msg);
  }

  async markAsRead(messageId: string) {
    await this.chatRepo.update(messageId, { is_read: true });
    return { success: true };
  }
}
