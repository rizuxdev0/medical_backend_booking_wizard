import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillableItemsService } from './billable-items.service';
import { BillableItemsController } from './billable-items.controller';
import { BillableItem } from '../invoices/entities/billable-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillableItem])],
  controllers: [BillableItemsController],
  providers: [BillableItemsService],
  exports: [BillableItemsService],
})
export class BillableItemsModule {}
