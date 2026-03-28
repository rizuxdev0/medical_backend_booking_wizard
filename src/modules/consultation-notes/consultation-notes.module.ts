import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationNotesService } from './consultation-notes.service';
import { ConsultationNotesController } from './consultation-notes.controller';
import { ConsultationNote } from '../appointments/entities/consultation-note.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { Patient } from '../patients/entities/patient.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConsultationNote,
      Appointment,
      Practitioner,
      Patient,
    ]),
    SettingsModule,
  ],
  controllers: [ConsultationNotesController],
  providers: [ConsultationNotesService],
  exports: [ConsultationNotesService],
})
export class ConsultationNotesModule {}
