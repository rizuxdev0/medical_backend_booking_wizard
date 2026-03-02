import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Practitioner } from './practitioner.entity';

@Entity('practitioner_schedules')
export class PractitionerSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'practitioner_id' })
  practitionerId: string;

  @Column({ name: 'day_of_week' })
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.schedules)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
}
