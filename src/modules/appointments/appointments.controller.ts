import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Permissions('appointments.view')
  @ApiOperation({ summary: 'Liste des rendez-vous avec filtres' })
  findAll(
    @Query() query: AppointmentQueryDto,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findAll(query);
  }

  @Get('available-practitioners')
  @Permissions('appointments.create')
  @ApiOperation({ summary: 'Liste les praticiens disponibles pour un créneau' })
  findAvailable(
    @Query('scheduled_at') scheduledAt: string,
    @Query('duration_minutes') duration?: number,
  ) {
    return this.appointmentsService.findAvailablePractitioners(
      new Date(scheduledAt),
      duration ? Number(duration) : 30,
    );
  }

  @Get(':id')
  @Permissions('appointments.view')
  @ApiOperation({ summary: "Détail d'un rendez-vous" })
  findOne(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id);
  }

  @Get('my/list')
  @ApiOperation({ summary: 'Liste mes rendez-vous (en tant que patient)' })
  findMy(@CurrentUser() user): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findByUser(user.id);
  }

  @Post()
  @Permissions('appointments.create')
  @ApiOperation({ summary: 'Créer un nouveau rendez-vous' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto, user.id);
  }

  @Patch(':id')
  @Permissions('appointments.edit')
  @ApiOperation({ summary: 'Modifier un rendez-vous' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @Permissions('appointments.edit')
  @ApiOperation({ summary: "Changer le statut d'un rendez-vous" })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/reschedule')
  @Permissions('appointments.edit')
  @ApiOperation({ summary: 'Replanifier un rendez-vous' })
  reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.reschedule(id, rescheduleDto);
  }

  @Delete(':id')
  @Permissions('appointments.delete')
  @ApiOperation({ summary: 'Annuler un rendez-vous (soft delete)' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.appointmentsService.remove(id);
  }
}

