import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { ResourceSchedule } from './entities/resource-schedule.entity';
import { ResourceBooking } from './entities/resource-booking.entity';
import { ResourceMaintenanceLog } from './entities/resource-maintenance-log.entity';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { PractitionersModule } from '../practitioners/practitioners.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      ResourceSchedule,
      ResourceBooking,
      ResourceMaintenanceLog,
      Practitioner,
    ]),
    PractitionersModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [TypeOrmModule, ResourcesService],
})
export class ResourcesModule {}


