import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sender_id: string;

  @Column({ nullable: true })
  @Index()
  receiver_id: string; // If NULL, it's a broadcast/room message

  @Column({ nullable: true })
  @Index()
  room_id: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  type: string; // 'text', 'image', 'system'

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
