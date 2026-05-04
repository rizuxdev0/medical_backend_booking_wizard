import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { PharmacyInventory } from './entities/pharmacy-inventory.entity';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';

@Injectable()
export class PharmacyInventoryService {
  constructor(
    @InjectRepository(PharmacyInventory)
    private repo: Repository<PharmacyInventory>,
    @InjectRepository(StockMovement)
    private movementRepo: Repository<StockMovement>,
    private readonly notifications: NotificationsService,
    @Inject(forwardRef(() => PurchaseOrdersService))
    private readonly purchaseOrders: PurchaseOrdersService,
  ) {}

  /**
   * Runs all automated logic: expiration alerts, low stock alerts, and auto-restock PO generation.
   */
  async runInventoryAutomation() {
    console.log('--- Starting Inventory Automation Checks ---');
    
    // 1. Check for Expiring Lots (3 months threshold)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const expiringSoon = await this.repo.find({
      where: {
        expiryDate: LessThanOrEqual(threeMonthsFromNow)
      }
    });

    for (const item of expiringSoon) {
      const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      
      await this.notifications.createLog({
        type: 'pharmacy_alert',
        title: '⚠️ Alerte Péremption IMMINENTE',
        message: `Le produit "${item.name}" (Lot: ${item.batchNumber}) expire dans ${daysLeft} jours.`,
        data: { id: item.id, type: 'expiry', expiryDate: item.expiryDate }
      });
    }

    // 2. Check for Low Stock items
    const allItems = await this.repo.find();
    const lowStockItems = allItems.filter(item => item.stock <= item.minStock);

    for (const item of lowStockItems) {
      await this.notifications.createLog({
        type: 'pharmacy_alert',
        title: '📉 Alerte Stock Faible',
        message: `Le produit "${item.name}" est à ${item.stock} ${item.unit || 'unités'} (Seuil: ${item.minStock}).`,
        data: { id: item.id, type: 'low_stock', current: item.stock, min: item.minStock }
      });
    }

    // 3. Automate Purchase Order Generation for low stock items
    let autoPOs: any[] = [];
    if (lowStockItems.length > 0) {
      console.log(`Generating auto-restock for ${lowStockItems.length} items...`);
      const result = await this.purchaseOrders.generateAutoRestock();
      
      if (Array.isArray(result)) {
        autoPOs = result;
      }
      
      if (autoPOs.length > 0) {
        await this.notifications.createLog({
          type: 'purchase_order',
          title: '🛒 Commandes Auto-Générées',
          message: `${autoPOs.length} bons de commande draft ont été créés suite aux alertes de stock.`,
          data: { order_ids: autoPOs.map(o => o.id) }
        });
      }
    }

    return {
      expiringCount: expiringSoon.length,
      lowStockCount: lowStockItems.length,
      autoOrdersCount: autoPOs.length
    };
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  async create(data: any) {
    const item = this.repo.create(data);
    const savedItem = await this.repo.save(item);
    
    // Si on initialise avec du stock, on enregistre le mouvement initial
    if (savedItem.stock > 0) {
      await this.recordMovement({
        itemId: savedItem.id,
        type: MovementType.IN,
        quantity: savedItem.stock,
        reason: 'Stock initial / Création'
      });
    }
    
    return savedItem;
  }

  async updateStock(id: string, quantity: number, type: MovementType = MovementType.ADJUSTMENT, reason?: string, userId?: string) {
    const item = await this.repo.findOneBy({ id });
    if (!item) return null;
    
    // Update stock level
    item.stock = Number(item.stock) + Number(quantity);
    const updatedItem = await this.repo.save(item);

    // Record movement
    await this.recordMovement({
      itemId: id,
      type,
      quantity,
      reason: reason || 'Mise à jour manuelle',
      performedById: userId
    });

    return updatedItem;
  }

  async recordMovement(data: { itemId: string, type: MovementType, quantity: number, reason: string, performedById?: string }) {
    const movement = this.movementRepo.create(data);
    return this.movementRepo.save(movement);
  }

  findAllMovements() {
    return this.movementRepo.find({
      relations: ['item', 'performedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  findMovementsByItem(itemId: string) {
    return this.movementRepo.find({
      where: { itemId },
      relations: ['performedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getAlerts() {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const expiringSoon = await this.repo.find({
      where: {
        expiryDate: LessThanOrEqual(threeMonthsFromNow),
        status: 'ACTIVE'
      }
    });

    const allItems = await this.repo.find();
    const lowStock = allItems.filter(item => item.stock <= item.minStock);

    return {
      expiringSoon,
      lowStock,
      totalAlerts: expiringSoon.length + lowStock.length
    };
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
