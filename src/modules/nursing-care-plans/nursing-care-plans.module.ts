import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NursingCarePlansService } from './nursing-care-plans.service';
import { NursingCarePlansController } from './nursing-care-plans.controller';
import { NursingCarePlan } from './entities/nursing-care-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NursingCarePlan])],
  controllers: [NursingCarePlansController],
  providers: [NursingCarePlansService],
  exports: [NursingCarePlansService]
})
export class NursingCarePlansModule {}
