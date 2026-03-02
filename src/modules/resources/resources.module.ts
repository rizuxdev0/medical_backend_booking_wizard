import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { ResourceSchedule } from './entities/resource-schedule.entity';
import { ResourceBooking } from './entities/resource-booking.entity';
import { ResourceMaintenanceLog } from './entities/resource-maintenance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      ResourceSchedule,
      ResourceBooking,
      ResourceMaintenanceLog,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class ResourcesModule {}
