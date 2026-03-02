import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('resource_maintenance_logs')
export class ResourceMaintenanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resource_id' })
  resourceId: string;

  @Column({ name: 'maintenance_type' })
  maintenanceType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'maintenance_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  maintenanceDate: string;

  @Column({ name: 'next_scheduled_date', type: 'date', nullable: true })
  nextScheduledDate: string;

  @Column({ name: 'performed_by', nullable: true })
  performedBy: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cost: number;

  @Column({ default: 'completed' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Resource, (resource) => resource.maintenanceLogs)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
