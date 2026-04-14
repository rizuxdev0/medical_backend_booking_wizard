import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Profile } from '../users/entities/profile.entity';
import { Patient } from '../patients/entities/patient.entity';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationLog,
      Appointment,
      Profile,
      Patient,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
