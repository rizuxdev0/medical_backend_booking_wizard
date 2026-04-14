import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nursing_care_plans')
export class NursingCarePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  time: string;

  @Column()
  task: string;

  @Column({ default: 'pending' })
  status: string; // 'done' | 'pending'

  @Column()
  patientName: string;

  @Column()
  bedId: string;

  @Column({ type: 'varchar', nullable: true })
  type: string; // 'medication' | 'care' | 'monitoring'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
