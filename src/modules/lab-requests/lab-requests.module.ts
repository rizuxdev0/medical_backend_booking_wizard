import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRequestsService } from './lab-requests.service';
import { LabRequestsController } from './lab-requests.controller';
import { LabRequest } from './entities/lab-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LabRequest])],
  controllers: [LabRequestsController],
  providers: [LabRequestsService]
})
export class LabRequestsModule {}
