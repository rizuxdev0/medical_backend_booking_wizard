import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClinicalActsService } from './clinical-acts.service';
import { CreateClinicalActDto } from './dto/create-clinical-act.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('clinical-acts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinical-acts')
export class ClinicalActsController {
  constructor(private readonly service: ClinicalActsService) {}

  @Post()
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Enregistrer un acte clinique' })
  create(@Body() createDto: CreateClinicalActDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles('admin', 'accountant', 'secretary', 'doctor')
  @ApiOperation({ summary: 'Liste des actes cliniques' })
  findAll(@Query('patientId') patientId?: string) {
    if (patientId) return this.service.findByPatient(patientId);
    return this.service.findAll();
  }

  @Patch(':id/billed')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Marquer comme facturé' })
  markAsBilled(@Param('id') id: string) {
    return this.service.markAsBilled(id);
  }
}
