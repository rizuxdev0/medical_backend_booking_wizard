import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentTypesController } from './appointment-types.controller';
import { Appointment } from './entities/appointment.entity';
import { AppointmentType } from './entities/appointment-type.entity';
import { ConsultationNote } from './entities/consultation-note.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { PractitionerSchedule } from '../practitioners/entities/practitioner-schedule.entity';
import { PractitionerAbsence } from '../practitioners/entities/practitioner-absence.entity';
import { Resource } from '../resources/entities/resource.entity';
import { Profile } from '../users/entities/profile.entity';
import { ResourcesModule } from '../resources/resources.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentType,
      ConsultationNote,
      Patient,
      Practitioner,
      PractitionerSchedule,
      PractitionerAbsence,
      Resource,
      Profile,
    ]),
    ResourcesModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AppointmentsController, AppointmentTypesController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
