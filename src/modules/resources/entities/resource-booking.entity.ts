import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('resource_bookings')
export class ResourceBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resource_id' })
  resourceId: string;

  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Resource, (resource) => resource.bookings)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
