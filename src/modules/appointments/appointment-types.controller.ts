import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
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
}
