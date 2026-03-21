import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';
import { Practitioner } from './entities/practitioner.entity';
import { PractitionerSchedule } from './entities/practitioner-schedule.entity';
import { PractitionerAbsence } from './entities/practitioner-absence.entity';
import { PractitionerGuard } from './entities/practitioner-guard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Practitioner,
      PractitionerSchedule,
      PractitionerAbsence,
      PractitionerGuard,
    ]),
  ],
  controllers: [PractitionersController],
  providers: [PractitionersService],
  exports: [PractitionersService, TypeOrmModule],
})

export class PractitionersModule {}
