import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardsService } from './guards.service';
import { GuardsController } from './guards.controller';
import { PractitionerGuard } from '../practitioners/entities/practitioner-guard.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PractitionerGuard, Practitioner])],
  controllers: [GuardsController],
  providers: [GuardsService],
  exports: [GuardsService],
})
export class GuardsModule {}
