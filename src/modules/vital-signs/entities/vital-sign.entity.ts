import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('vital_signs')
export class VitalSign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column('decimal', { precision: 4, scale: 1, nullable: true })
  temperature: number; // °C

  @Column({ nullable: true })
  systolicBP: number; // mmHg

  @Column({ nullable: true })
  diastolicBP: number; // mmHg

  @Column({ nullable: true })
  pulse: number; // bpm

  @Column({ nullable: true })
  spO2: number; // %

  @Column({ nullable: true })
  respiratoryRate: number; // inspirations/min

  @Column({ nullable: true })
  weight: number; // kg

  @Column({ nullable: true })
  notes: string;

  @Column()
  recordedById: string;

  @Column()
  recordedByName: string;

  @CreateDateColumn()
  recordedAt: Date;
}
