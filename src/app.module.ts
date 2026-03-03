import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { PractitionersModule } from './modules/practitioners/practitioners.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { QueueModule } from './modules/queue/queue.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ConsultationNotesModule } from './modules/consultation-notes/consultation-notes.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { GuardsModule } from './modules/guards/guards.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    PractitionersModule,

    ResourcesModule, // Ajout
    AppointmentsModule,
    InvoicesModule,
    QueueModule,

    ActivityLogsModule,
    DepartmentsModule,

    CurrenciesModule,
    GuardsModule,
    NotificationsModule,
    PermissionsModule,
    ConsultationNotesModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
