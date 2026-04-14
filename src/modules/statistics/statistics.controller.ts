import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('appointments')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Statistiques des rendez-vous' })
  async getAppointments(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('practitioner_id') practitionerId?: string,
  ) {
    return this.statisticsService.getAppointmentsStats(start, end, practitionerId);
  }

  @Get('queue')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Statistiques de la file d\'attente' })
  async getQueueEntries(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.statisticsService.getQueueStats(start, end);
  }

  @Get('occupancy')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Statistiques d\'occupation des lits' })
  async getOccupancy() {
    return this.statisticsService.getOccupancyStats();
  }
}

