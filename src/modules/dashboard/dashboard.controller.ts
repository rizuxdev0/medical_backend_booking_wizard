import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('today-appointments')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: "Liste des rendez-vous d'aujourd'hui" })
  getTodayAppointments(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.dashboardService.getTodayAppointments(start, end);
  }

  @Get('appointment-stats')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Statistiques des rendez-vous' })
  getAppointmentStats(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.dashboardService.getAppointmentStats(start, end);
  }

  @Get('total-patients')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Nombre total de patients' })
  getTotalPatients() {
    return this.dashboardService.getTotalPatients();
  }

  @Get('recent-patients')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Liste des patients récents' })
  getRecentPatients(@Query('since') since: string) {
    return this.dashboardService.getRecentPatients(since);
  }

  @Get('weekly-trends')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Tendances hebdomadaires' })
  getWeeklyTrends(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.dashboardService.getWeeklyTrends(start, end);
  }

  @Get('monthly-revenue')
  @Roles('admin')
  @ApiOperation({ summary: 'Revenus mensuels' })
  getMonthlyRevenue(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.dashboardService.getMonthlyRevenue(start, end);
  }

  @Get('unpaid-count')
  @Roles('admin', 'receptionist')
  @ApiOperation({ summary: 'Nombre de factures impayées' })
  getUnpaidCount() {
    return this.dashboardService.getUnpaidCount();
  }

  @Get('practitioner-occupancy')
  @Roles('admin', 'doctor', 'receptionist')
  @ApiOperation({ summary: "Taux d'occupation par praticien" })
  getPractitionerOccupancy(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.dashboardService.getPractitionerOccupancy(start, end);
  }

  @Get('queue-stats')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: "Statistiques de la file d'attente" })
  getQueueStats() {
    return this.dashboardService.getQueueStats();
  }

  @Get('practitioner-statuses')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'État des praticiens en temps réel' })
  getPractitionerStatuses() {
    return this.dashboardService.getPractitionerStatuses();
  }
}
