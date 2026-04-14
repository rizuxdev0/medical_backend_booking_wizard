import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ambulance_transfers')
export class AmbulanceTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientName: string;

  @Column()
  type: string; // 'inbound' | 'outbound'

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column({ nullable: true })
  ambulanceId: string;

  @Column({ default: 'normal' })
  priority: string; // 'critical' | 'normal' | 'low'

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'in_transit' | 'completed' | 'cancelled'

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
