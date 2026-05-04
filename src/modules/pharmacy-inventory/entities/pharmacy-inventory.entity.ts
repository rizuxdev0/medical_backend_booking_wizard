import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pharmacy_inventory')
export class PharmacyInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 'DRUG' })
  itemType: 'DRUG' | 'CONSUMABLE'; // MEDICAMENT ou CONSOMMABLE

  @Column({ nullable: true, unique: true })
  sku: string; // Référence unique

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 10, name: 'min_stock' })
  minStock: number;

  @Column({ nullable: true })
  location: string; // Ex: Pharmacie Centrale - Rayon A1

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ nullable: true })
  unit: string; // Boîte, Unité, Flacon, Seringue...

  @Column({ nullable: true, name: 'batch_number' })
  batchNumber: string;

  @Column({ type: 'date', nullable: true, name: 'expiry_date' })
  expiryDate: Date;

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'EXPIRED' | 'DISCONTINUED';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
