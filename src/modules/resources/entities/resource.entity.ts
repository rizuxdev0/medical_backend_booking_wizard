import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ResourceBooking } from './resource-booking.entity';
import { ResourceMaintenanceLog } from './resource-maintenance-log.entity';
import { ResourceSchedule } from './resource-schedule.entity';

export type ResourceType = 'room' | 'equipment';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: ResourceType;


  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'maintenance_required', default: false })
  maintenanceRequired: boolean;

  @Column({ name: 'assigned_practitioner_id', nullable: true })
  assignedPractitionerId: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: string;

  @Column({ name: 'warranty_expiry_date', type: 'date', nullable: true })
  warrantyExpiryDate: string;

  @Column({ name: 'last_maintenance_date', type: 'date', nullable: true })
  lastMaintenanceDate: string;

  @Column({ name: 'next_maintenance_date', type: 'date', nullable: true })
  nextMaintenanceDate: string;

  @Column({
    name: 'cost_per_hour',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  costPerHour: number;

  @Column({ name: 'contact_person', nullable: true })
  contactPerson: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => ResourceSchedule, (schedule) => schedule.resource)
  schedules: ResourceSchedule[];

  @OneToMany(() => ResourceBooking, (booking) => booking.resource)
  bookings: ResourceBooking[];

  @OneToMany(() => ResourceMaintenanceLog, (log) => log.resource)
  maintenanceLogs: ResourceMaintenanceLog[];
}
