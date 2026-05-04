import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExpenseCategory {
  RENT = 'RENT',
  SALARY = 'SALARY',
  SUPPLIES = 'SUPPLIES',
  MAINTENANCE = 'MAINTENANCE',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.OTHER,
  })
  category: ExpenseCategory;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  reference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
