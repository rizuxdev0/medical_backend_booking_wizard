import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { QueueEntry } from '../queue/entities/queue-entry.entity';

import { InpatientBed } from '../inpatient-beds/entities/inpatient-bed.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Patient } from '../patients/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, QueueEntry, InpatientBed, Invoice, Patient]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
