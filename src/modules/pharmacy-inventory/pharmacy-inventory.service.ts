import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { PharmacyInventory } from './entities/pharmacy-inventory.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';

@Injectable()
export class PharmacyInventoryService {
  constructor(
    @InjectRepository(PharmacyInventory)
    private repo: Repository<PharmacyInventory>,
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

  create(data: any) {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  async updateStock(id: string, quantity: number) {
    const item = await this.repo.findOneBy({ id });
    if (!item) return null;
    item.stock += quantity;
    return this.repo.save(item);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
