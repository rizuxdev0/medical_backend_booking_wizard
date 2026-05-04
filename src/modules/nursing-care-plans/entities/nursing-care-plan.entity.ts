import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nursing_care_plans')
export class NursingCarePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scheduledAt: Date;

  @Column()
  task: string;

  @Column({ default: 'pending' })
  status: string; // 'done' | 'pending'

  @Column({ nullable: true })
  patientId: string;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  bedId: string;

  @Column({ type: 'varchar', nullable: true })
  type: string; // 'medication' | 'care' | 'monitoring'

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  performedBy: string;

  @Column({ nullable: true })
  performedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
