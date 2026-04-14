import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ name: 'blood_type', nullable: true })
  bloodType: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ name: 'marital_status', nullable: true })
  maritalStatus: string;

  @Column({ name: 'preferred_language', nullable: true, default: 'Français' })
  preferredLanguage: string;

  @Column({ name: 'social_security_number', nullable: true })
  socialSecurityNumber: string;

  @Column({ name: 'insurance_provider', nullable: true })
  insuranceProvider: string;

  @Column({ name: 'insurance_number', nullable: true })
  insuranceNumber: string;

  @Column({ name: 'insurer_id', nullable: true })
  insurerId: string;

  @Column({ name: 'coverage_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  coverageRate: number;

  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Column({ nullable: true })
  allergies: string;

  @Column({ name: 'medical_notes', nullable: true })
  medicalNotes: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'weight', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ name: 'height', type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ name: 'chronic_diseases', type: 'text', nullable: true })
  chronicDiseases: string;

  @Column({ name: 'current_medications', type: 'text', nullable: true })
  currentMedications: string;

  @Column({ name: 'family_history', type: 'text', nullable: true })
  familyHistory: string;

  @Column({ name: 'vaccination_history', type: 'text', nullable: true })
  vaccinationHistory: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
