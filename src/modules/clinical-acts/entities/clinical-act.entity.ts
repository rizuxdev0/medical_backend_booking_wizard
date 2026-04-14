import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('clinical_acts')
export class ClinicalAct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ nullable: true })
  appointmentId: string;

  @Column()
  patientName: string;

  @Column()
  actName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'billed'

  @CreateDateColumn()
  date: Date;
}
