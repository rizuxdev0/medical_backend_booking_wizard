import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VitalSignsService } from './vital-signs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vital-signs')
export class VitalSignsController {
  constructor(private readonly service: VitalSignsService) {}

  @Get('patient/:patientId')
  findAllByPatient(@Param('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }

  @Get('patient/:patientId/latest')
  getLatest(@Param('patientId') patientId: string) {
    return this.service.getLatest(patientId);
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }
}
