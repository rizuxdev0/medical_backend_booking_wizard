import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareProtocolsService } from './care-protocols.service';
import { CareProtocolsController } from './care-protocols.controller';
import { CareProtocol } from './entities/care-protocol.entity';
import { NursingCarePlansModule } from '../nursing-care-plans/nursing-care-plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareProtocol]),
    NursingCarePlansModule
  ],
  controllers: [CareProtocolsController],
  providers: [CareProtocolsService],
})
export class CareProtocolsModule {}
