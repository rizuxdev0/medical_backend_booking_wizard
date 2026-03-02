import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('resource_schedules')
export class ResourceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resource_id' })
  resourceId: string;

  @Column({ name: 'day_of_week' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Resource, (resource) => resource.schedules)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
