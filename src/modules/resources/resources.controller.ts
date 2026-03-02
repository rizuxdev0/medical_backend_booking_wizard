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
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateResourceScheduleDto } from './dto/create-schedule.dto';
import { CreateResourceBookingDto } from './dto/create-booking.dto';
import { CreateMaintenanceLogDto } from './dto/create-maintenance.dto';
import { ResourceQueryDto } from './dto/resource-query.dto';
import {
  ResourceResponseDto,
  ResourceScheduleResponseDto,
  ResourceBookingResponseDto,
  MaintenanceLogResponseDto,
} from './dto/resource-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('resources')
@ApiBearerAuth()
@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // ==================== CRUD RESSOURCES ====================

  @Get()
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Liste toutes les ressources' })
  findAll(@Query() query: ResourceQueryDto): Promise<ResourceResponseDto[]> {
    return this.resourcesService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: "Détail d'une ressource" })
  findOne(@Param('id') id: string): Promise<ResourceResponseDto> {
    return this.resourcesService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une nouvelle ressource' })
  create(
    @Body() createResourceDto: CreateResourceDto,
  ): Promise<ResourceResponseDto> {
    return this.resourcesService.create(createResourceDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Modifier une ressource' })
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ): Promise<ResourceResponseDto> {
    return this.resourcesService.update(id, updateResourceDto);
  }

  // ==================== HORAIRES ====================

  @Get(':id/schedule')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Récupérer les horaires d'une ressource" })
  getSchedules(
    @Param('id') id: string,
  ): Promise<ResourceScheduleResponseDto[]> {
    return this.resourcesService.getSchedules(id);
  }

  @Put(':id/schedule')
  @Roles('admin')
  @ApiOperation({ summary: "Mettre à jour les horaires d'une ressource" })
  updateSchedules(
    @Param('id') id: string,
    @Body() schedules: CreateResourceScheduleDto[],
  ): Promise<ResourceScheduleResponseDto[]> {
    return this.resourcesService.updateSchedules(id, schedules);
  }

  // ==================== RÉSERVATIONS ====================

  @Get(':id/bookings')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Récupérer les réservations d'une ressource" })
  getBookings(
    @Param('id') id: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ): Promise<ResourceBookingResponseDto[]> {
    return this.resourcesService.getBookings(id, dateFrom, dateTo);
  }

  @Post(':id/bookings')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Créer une réservation pour une ressource' })
  createBooking(
    @Param('id') id: string,
    @Body() createBookingDto: CreateResourceBookingDto,
  ): Promise<ResourceBookingResponseDto> {
    return this.resourcesService.createBooking(id, createBookingDto);
  }

  // ==================== MAINTENANCE ====================

  @Get(':id/maintenance')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: "Récupérer l'historique de maintenance" })
  getMaintenanceLogs(
    @Param('id') id: string,
  ): Promise<MaintenanceLogResponseDto[]> {
    return this.resourcesService.getMaintenanceLogs(id);
  }

  @Post(':id/maintenance')
  @Roles('admin')
  @ApiOperation({ summary: 'Ajouter une entrée de maintenance' })
  addMaintenanceLog(
    @Param('id') id: string,
    @Body() createMaintenanceDto: CreateMaintenanceLogDto,
  ): Promise<MaintenanceLogResponseDto> {
    return this.resourcesService.addMaintenanceLog(id, createMaintenanceDto);
  }
}
