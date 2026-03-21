import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { PractitionerAbsence } from './practitioner-absence.entity';
import { PractitionerSchedule } from './practitioner-schedule.entity';
import { PractitionerGuard } from './practitioner-guard.entity';

@Entity('practitioners')
export class Practitioner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @Column({
    name: 'consultation_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  consultationFee: number;

  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience: number;

  @Column({ type: 'text', array: true, default: ['Français'] })
  languages: string[];

  @Column({ name: 'calendar_color', nullable: true, default: '#3B82F6' })
  calendarColor: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ name: 'accepts_new_patients', default: true })
  acceptsNewPatients: boolean;

  @Column({ name: 'max_patients_per_day', nullable: true })
  maxPatientsPerDay: number;

  @Column({ name: 'appointment_buffer_minutes', default: 0 })
  appointmentBufferMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PractitionerSchedule, (schedule) => schedule.practitioner)
  schedules: PractitionerSchedule[];

  @OneToMany(() => PractitionerAbsence, (absence) => absence.practitioner)
  absences: PractitionerAbsence[];

  @OneToMany(() => PractitionerGuard, (guard) => guard.practitioner)
  guards: PractitionerGuard[];

  @OneToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  profile: Profile;
}
