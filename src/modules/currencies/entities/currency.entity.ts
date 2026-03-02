import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string; // XOF, USD, EUR, etc.

  @Column()
  name: string; // Franc CFA, Dollar, Euro

  @Column()
  symbol: string; // FCFA, $, €

  @Column({ name: 'decimal_places', default: 2 })
  decimalPlaces: number;

  @Column({ name: 'decimal_separator', default: ',' })
  decimalSeparator: string;

  @Column({ name: 'thousands_separator', default: ' ' })
  thousandsSeparator: string;

  @Column({ name: 'symbol_position', default: 'after' }) // before or after
  symbolPosition: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 1,
  })
  exchangeRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
