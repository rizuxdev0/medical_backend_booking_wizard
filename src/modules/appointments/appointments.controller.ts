import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Liste des rendez-vous avec filtres' })
  findAll(
    @Query() query: AppointmentQueryDto,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: "Détail d'un rendez-vous" })
  findOne(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Créer un nouveau rendez-vous' })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto, user.id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Modifier un rendez-vous' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Changer le statut d'un rendez-vous" })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/reschedule')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Replanifier un rendez-vous' })
  reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.reschedule(id, rescheduleDto);
  }

  @Delete(':id')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Annuler un rendez-vous (soft delete)' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.appointmentsService.remove(id);
  }
}
