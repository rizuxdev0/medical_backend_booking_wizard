import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { Practitioner } from '../../practitioners/entities/practitioner.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Profile } from '../../users/entities/profile.entity';

@Entity('consultation_notes')
export class ConsultationNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id', unique: true })
  appointmentId: string;

  @Column({ name: 'practitioner_id' })
  practitionerId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'parent_consultation_id', nullable: true })
  parentConsultationId: string;

  @Column({ name: 'consultation_number', default: 1 })
  consultationNumber: number;

  @Column({ name: 'consultation_type', default: 'initial' })
  consultationType: string;

  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ name: 'history_present_illness', type: 'text', nullable: true })
  historyPresentIllness: string;

  @Column({ name: 'examination_findings', type: 'text', nullable: true })
  examinationFindings: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ name: 'treatment_plan', type: 'text', nullable: true })
  treatmentPlan: string;

  @Column({ type: 'text', nullable: true })
  prescriptions: string;

  @Column({ name: 'vital_signs', type: 'jsonb', nullable: true })
  vitalSigns: any;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  followUpDate: string;

  @Column({ name: 'is_closed', default: false })
  isClosed: boolean;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date;

  @Column({ name: 'closed_by', nullable: true })
  closedBy: string;

  @Column({ name: 'is_signed', default: false })
  isSigned: boolean;

  @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
  signedAt: Date;

  @Column({ name: 'signature_hash', type: 'text', nullable: true })
  signatureHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => Practitioner)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => ConsultationNote)
  @JoinColumn({ name: 'parent_consultation_id' })
  parentConsultation: ConsultationNote;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'closed_by' })
  closer: Profile;
}
