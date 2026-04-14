import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PharmacyInventory } from '../pharmacy-inventory/entities/pharmacy-inventory.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierPrice } from '../suppliers/entities/supplier-price.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder) private repo: Repository<PurchaseOrder>,
    @InjectRepository(PharmacyInventory) private inventoryRepo: Repository<PharmacyInventory>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(SupplierPrice) private priceRepo: Repository<SupplierPrice>,
  ) {}

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: any): Promise<PurchaseOrder> {
    // Generate order number PO-YYYYMMDD-XXX
    const count = await this.repo.count();
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const orderNumber = `PO-${date}-${(count + 1).toString().padStart(3, '0')}`;
    
    const po = this.repo.create({ ...dto, orderNumber } as any);
    return this.repo.save(po as any) as Promise<PurchaseOrder>;
  }

  async update(id: string, dto: any) {
    await this.repo.update(id, dto);
    const po = await this.findOne(id);

    // If status changed to 'received', update inventory!
    if (dto.status === 'received' && po) {
      for (const item of po.items) {
        // Try to find matching inventory item
        const invItem = await this.inventoryRepo.findOne({ where: { name: item.name } });
        if (invItem) {
          invItem.stock += item.quantity;
          await this.inventoryRepo.save(invItem);
        } else {
          // Create new inventory item if it doesn't exist
          const newItem = this.inventoryRepo.create({
            name: item.name,
            stock: item.quantity,
            unit: 'Unit',
            category: 'Général',
            preferredSupplierId: po.supplierId
          });
          await this.inventoryRepo.save(newItem);
        }
      }
    }
    return po;
  }

  async generateAutoRestock() {
    // 1. Find all items below min stock
    const itemsToRestock = await this.inventoryRepo.find();
    const lowStockItems = itemsToRestock.filter(i => i.stock <= i.minStock);

    if (lowStockItems.length === 0) return { message: 'Tous les stocks sont suffisants.' };

    // 2. Group by preferred supplier
    const supplierGroups: Record<string, PharmacyInventory[]> = {};
    for (const item of lowStockItems) {
      const sId = item.preferredSupplierId || 'default';
      if (!supplierGroups[sId]) supplierGroups[sId] = [];
      supplierGroups[sId].push(item);
    }

    const createdOrders: PurchaseOrder[] = [];

    // 3. Create Draft PO for each supplier
    for (const [sId, items] of Object.entries(supplierGroups)) {
      let supplierName = 'Fournisseur Par Défaut';
      if (sId !== 'default') {
        const s = await this.supplierRepo.findOne({ where: { id: sId } });
        if (s) supplierName = s.name;
      }

      let totalAmount = 0;
      const poItems: any[] = [];

      for (const item of items) {
        let negotiatedPrice = 0;
        
        // Find negotiated price if supplier is set
        if (sId !== 'default') {
          const priceRecord = await this.priceRepo.findOne({
            where: { supplierId: sId, productName: item.name }
          });
          if (priceRecord) negotiatedPrice = Number(priceRecord.negotiatedPrice);
        }

        const quantity = item.minStock * 2;
        const lineTotal = quantity * negotiatedPrice;
        totalAmount += lineTotal;

        poItems.push({
          name: item.name,
          quantity: quantity,
          pricePerUnit: negotiatedPrice,
        });
      }

      const newOrder = await this.create({
        supplierId: sId === 'default' ? null : sId,
        supplierName,
        items: poItems,
        status: 'pending',
        notes: 'Généré automatiquement (Stock Faible - Prix négociés appliqués si disponibles)',
        totalAmount: totalAmount
      });
      createdOrders.push(newOrder);
    }

    return createdOrders;
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
