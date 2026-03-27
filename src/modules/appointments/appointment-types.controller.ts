import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentTypeDto } from './dto/create-appointment-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('appointment-types')
@ApiBearerAuth()
@Controller('appointment-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentTypesController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Liste tous les types de rendez-vous actifs' })
  findAll() {
    return this.appointmentsService.findAllAppointmentTypes();
  }

  @Post()
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Crée un nouveau type de rendez-vous' })
  @ApiBody({ type: CreateAppointmentTypeDto })
  create(@Body() createDto: CreateAppointmentTypeDto) {
    return this.appointmentsService.createAppointmentType(createDto);
  }

  @Patch(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Modifie un type de rendez-vous' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.appointmentsService.updateAppointmentType(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Supprime un type de rendez-vous (désactivation douce)' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.deleteAppointmentType(id);
  }
}
