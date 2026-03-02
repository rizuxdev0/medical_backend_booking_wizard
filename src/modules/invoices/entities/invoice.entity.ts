import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Practitioner } from '../../practitioners/entities/practitioner.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Profile } from '../../users/entities/profile.entity';
import { InvoiceInstallment } from './invoice-installment.entity';
import { Payment } from './payment.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @Column({ default: 'draft' })
  status: string; // draft, sent, paid, partial, overdue, cancelled

  @Column({ name: 'issue_date', type: 'date' })
  issueDate: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  taxRate: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Column({
    name: 'amount_paid',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  amountPaid: number;

  @Column({
    name: 'amount_due',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  amountDue: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ name: 'is_deferred', default: false })
  isDeferred: boolean;

  @Column({ name: 'installment_count', default: 1 })
  installmentCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Practitioner)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'created_by' })
  creator: Profile;

  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items: InvoiceItem[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  @OneToMany(() => InvoiceInstallment, (installment) => installment.invoice)
  installments: InvoiceInstallment[];
}
