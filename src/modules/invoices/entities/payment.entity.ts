import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Profile } from '../../users/entities/profile.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_number' })
  paymentNumber: string;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', default: 'cash' })
  paymentMethod: string; // cash, card, check, mobile_money, bank_transfer

  @Column({ name: 'payment_date', type: 'date', default: () => 'CURRENT_DATE' })
  paymentDate: Date;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'completed' })
  status: string; // pending, completed, failed

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ name: 'received_by', nullable: true })
  receivedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'received_by' })
  receiver: Profile;
}
