import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Practitioner } from '../../practitioners/entities/practitioner.entity';
import { Resource } from '../../resources/entities/resource.entity';

@Entity('queue_settings')
export class QueueSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ name: 'average_service_time_minutes', default: 15 })
  averageServiceTimeMinutes: number;

  @Column({ name: 'max_queue_size', nullable: true })
  maxQueueSize: number;

  @Column({ name: 'auto_call_enabled', default: false })
  autoCallEnabled: boolean;

  @Column({ name: 'display_position_to_patient', default: true })
  displayPositionToPatient: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Practitioner)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @ManyToOne(() => Resource)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
