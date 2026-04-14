import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalActsService } from './clinical-acts.service';
import { ClinicalActsController } from './clinical-acts.controller';
import { ClinicalAct } from './entities/clinical-act.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalAct])],
  controllers: [ClinicalActsController],
  providers: [ClinicalActsService]
})
export class ClinicalActsModule {}
