import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pharmacy_prescriptions')
export class PharmacyPrescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  ticketCode: string;

  @Column('jsonb')
  prescriptions: any[];

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  prescribedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
