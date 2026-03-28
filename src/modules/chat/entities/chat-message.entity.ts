import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  sender_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  recipient_id: string; // If NULL, it's a broadcast/room message

  @Column({ nullable: true })
  @Index()
  room_id: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
