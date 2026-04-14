import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbulanceTransfersService } from './ambulance-transfers.service';
import { AmbulanceTransfersController } from './ambulance-transfers.controller';
import { AmbulanceTransfer } from './entities/ambulance-transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AmbulanceTransfer])],
  controllers: [AmbulanceTransfersController],
  providers: [AmbulanceTransfersService]
})
export class AmbulanceTransfersModule {}
