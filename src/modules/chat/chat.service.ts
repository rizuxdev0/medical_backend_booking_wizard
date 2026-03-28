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

  async getConversations(userId: string) {
    const messages = await this.chatRepo.find({
      where: [
        { sender_id: userId },
        { recipient_id: userId }
      ],
      order: { created_at: 'DESC' },
      take: 1000,
    });
    
    return messages.map(msg => this.mapMessage(msg));
  }

  async getMessages(userId: string, partnerId: string) {
    const messages = await this.chatRepo.find({
      where: [
        { sender_id: userId, recipient_id: partnerId },
        { sender_id: partnerId, recipient_id: userId }
      ],
      order: { created_at: 'ASC' },
      take: 500,
    });
    
    return messages.map(msg => this.mapMessage(msg));
  }

  async saveMessage(senderId: string, content: string, roomId?: string, recipientId?: string) {
    const msg = this.chatRepo.create({
      sender_id: senderId,
      content,
      room_id: roomId,
      recipient_id: recipientId,
    });
    const saved = await this.chatRepo.save(msg);
    return this.mapMessage(saved);
  }

  async markAsRead(messageId: string) {
    await this.chatRepo.update(messageId, { is_read: true });
    return { success: true };
  }

  async markMessagesAsRead(senderId: string, recipientId: string) {
    await this.chatRepo.update(
      { sender_id: senderId, recipient_id: recipientId, is_read: false },
      { is_read: true }
    );
    return { success: true };
  }

  private mapMessage(msg: ChatMessage) {
    return {
      ...msg,
      // No more mapping needed since they match!
    };
  }
}
