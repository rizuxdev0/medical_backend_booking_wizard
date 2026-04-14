import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lab_requests')
export class LabRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  ticketCode: string;

  @Column()
  examType: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  results: string;

  @CreateDateColumn()
  prescribedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
