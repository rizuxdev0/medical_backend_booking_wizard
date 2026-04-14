import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('inpatient_beds')
export class InpatientBed {
  @PrimaryColumn()
  id: string; // e.g., '101A'

  @Column()
  room: string;

  @Column()
  type: string;

  @Column({ default: 'available' })
  status: string; // 'available' | 'occupied' | 'cleaning'

  @Column({ type: 'varchar', nullable: true })
  patient: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'patient_id' })
  patientId: string | null;

  @Column({ type: 'varchar', nullable: true })
  admission_date: string | null;

  @Column({ type: 'varchar', nullable: true })
  doctor: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
