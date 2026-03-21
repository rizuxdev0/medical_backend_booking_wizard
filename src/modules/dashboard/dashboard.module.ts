import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { QueueEntry } from '../queue/entities/queue-entry.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Patient,
      Invoice,
      QueueEntry,
      Practitioner,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
