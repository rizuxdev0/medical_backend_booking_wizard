import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueEntry } from './entities/queue-entry.entity';
import { QueueSettings } from './entities/queue-settings.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Resource } from '../resources/entities/resource.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QueueEntry,
      QueueSettings,
      Patient,
      Practitioner,
      Appointment,
      Resource,
    ]),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
