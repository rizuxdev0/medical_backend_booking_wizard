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

@Entity('patient_consents')
export class PatientConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @Column({ name: 'consent_type' })
  consentType: string;

  @Column({ name: 'consent_text', type: 'text' })
  consentText: string;

  @Column({ default: '1.0' })
  version: string;

  @Column({ name: 'is_signed', default: false })
  isSigned: boolean;

  @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
  signedAt: Date;

  @Column({ name: 'signature_hash', type: 'text', nullable: true })
  signatureHash: string;

  @Column({ name: 'signature_image', type: 'text', nullable: true })
  signatureImage: string;

  @Column({ name: 'witness_name', nullable: true })
  witnessName: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Practitioner)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
}
