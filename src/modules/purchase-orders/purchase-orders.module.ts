import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PharmacyInventory } from '../pharmacy-inventory/entities/pharmacy-inventory.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierPrice } from '../suppliers/entities/supplier-price.entity';
import { PharmacyInventoryModule } from '../pharmacy-inventory/pharmacy-inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, PharmacyInventory, Supplier, SupplierPrice]),
    forwardRef(() => PharmacyInventoryModule)
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService]
})
export class PurchaseOrdersModule {}
