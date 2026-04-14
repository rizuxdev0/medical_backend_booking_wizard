import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyPrescriptionsService } from './pharmacy-prescriptions.service';
import { PharmacyPrescriptionsController } from './pharmacy-prescriptions.controller';
import { PharmacyPrescription } from './entities/pharmacy-prescription.entity';

import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PharmacyPrescription]),
    PatientsModule
  ],
  controllers: [PharmacyPrescriptionsController],
  providers: [PharmacyPrescriptionsService]
})
export class PharmacyPrescriptionsModule {}
