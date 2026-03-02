import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('appointment_types')
export class AppointmentType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration_minutes', default: 30 })
  durationMinutes: number;

  @Column({ nullable: true, default: '#3B82F6' })
  color: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.appointmentType)
  appointments: Appointment[];
}
