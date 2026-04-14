import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyInventory } from './entities/pharmacy-inventory.entity';
import { PharmacyInventoryController } from './pharmacy-inventory.controller';
import { PharmacyInventoryService } from './pharmacy-inventory.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PharmacyInventory]),
    NotificationsModule,
    forwardRef(() => PurchaseOrdersModule)
  ],
  controllers: [PharmacyInventoryController],
  providers: [PharmacyInventoryService],
  exports: [PharmacyInventoryService]
})
export class PharmacyInventoryModule {}
