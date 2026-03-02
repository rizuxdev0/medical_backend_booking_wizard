import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  action: string; // create, update, delete, login, logout, etc.

  @Column({ name: 'entity_type' })
  entityType: string; // patient, appointment, invoice, etc.

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'entity_name', nullable: true })
  entityName: string;

  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: any;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}
