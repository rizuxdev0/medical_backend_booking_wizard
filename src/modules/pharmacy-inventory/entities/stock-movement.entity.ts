import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PharmacyInventory } from './pharmacy-inventory.entity';
import { Profile } from '../../users/entities/profile.entity';

export enum MovementType {
  IN = 'IN',           // Entrée (achat, retour patient)
  OUT = 'OUT',         // Sortie (vente, administration)
  ADJUSTMENT = 'ADJUSTMENT', // Ajustement manuel (inventaire, perte)
  TRANSFER = 'TRANSFER' // Transfert entre services
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'item_id' })
  itemId: string;

  @ManyToOne(() => PharmacyInventory)
  @JoinColumn({ name: 'item_id' })
  item: PharmacyInventory;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ nullable: true })
  reason: string; // Ex: "Achat fournisseur", "Péremption", "Erreur inventaire"

  @Column({ name: 'performed_by_id', nullable: true })
  performedById: string;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'performed_by_id' })
  performedBy: Profile;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
