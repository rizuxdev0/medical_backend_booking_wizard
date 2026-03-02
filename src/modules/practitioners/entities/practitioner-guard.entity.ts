import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Practitioner } from './practitioner.entity';

@Entity('practitioner_guards')
export class PractitionerGuard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'practitioner_id' })
  practitionerId: string;

  @Column({ name: 'guard_date', type: 'date' })
  guardDate: string;

  @Column({ name: 'start_time', type: 'time', default: '18:00' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', default: '08:00' })
  endTime: string;

  @Column({ name: 'guard_type', default: 'night' })
  guardType: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.guards)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
}
