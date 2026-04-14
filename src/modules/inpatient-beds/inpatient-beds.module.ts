import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InpatientBedsService } from './inpatient-beds.service';
import { InpatientBedsController } from './inpatient-beds.controller';
import { InpatientBed } from './entities/inpatient-bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InpatientBed])],
  controllers: [InpatientBedsController],
  providers: [InpatientBedsService]
})
export class InpatientBedsModule {}
