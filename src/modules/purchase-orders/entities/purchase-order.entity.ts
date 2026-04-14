import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderNumber: string; // PO-2026-001

  @Column()
  supplierId: string;

  @Column()
  supplierName: string;

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'ordered' | 'received' | 'cancelled'

  @Column('jsonb', { nullable: true })
  items: any[]; // Array of { name: string, quantity: number, pricePerUnit: number }

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  expectedArrivalDate: Date;

  @Column({ nullable: true })
  receivedDate: Date;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
