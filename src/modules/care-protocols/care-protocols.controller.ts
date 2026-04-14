import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CareProtocolsService } from './care-protocols.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('care-protocols')
export class CareProtocolsController {
  constructor(private readonly service: CareProtocolsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Post(':id/apply/:patientId')
  applyToPatient(@Param('id') id: string, @Param('patientId') patientId: string) {
    return this.service.applyToPatient(id, patientId);
  }
}
