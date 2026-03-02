import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Practitioner } from './practitioner.entity';

@Entity('practitioner_absences')
export class PractitionerAbsence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'practitioner_id' })
  practitionerId: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.absences)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
}
