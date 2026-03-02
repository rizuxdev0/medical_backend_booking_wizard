import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Practitioner } from '../../practitioners/entities/practitioner.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Resource } from '../../resources/entities/resource.entity';

@Entity('queue_entries')
export class QueueEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ name: 'queue_number', generated: 'increment' })
  queueNumber: number;

  @Column({ default: 0 })
  priority: number; // Plus le nombre est élevé, plus la priorité est haute

  @Column({ default: 'waiting' })
  status: string; // waiting, called, in_progress, completed, cancelled, no_show

  @Column({
    name: 'check_in_time',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  checkInTime: Date;

  @Column({ name: 'called_time', type: 'timestamptz', nullable: true })
  calledTime: Date;

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date;

  @Column({ name: 'estimated_wait_minutes', nullable: true })
  estimatedWaitMinutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Practitioner)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => Resource)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
