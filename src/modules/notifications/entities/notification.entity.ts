import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

export type NotificationType =
  | 'reminder'
  | 'confirmation'
  | 'cancellation'
  | 'update';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id' })
  appointmentId: string;

  @Column({
    type: 'enum',
    enum: ['reminder', 'confirmation', 'cancellation', 'update'],
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  })
  status: NotificationStatus;

  @Column({ name: 'scheduled_for', type: 'timestamptz' })
  scheduledFor: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
