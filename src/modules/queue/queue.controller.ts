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
import { QueueService } from './queue.service';
import { CheckInDto } from './dto/check-in.dto';
import { UpdateQueueStatusDto } from './dto/update-status.dto';
import { QueueQueryDto } from './dto/queue-query.dto';
import { QueueSettingsDto } from './dto/queue-settings.dto';
import {
  QueueEntryResponseDto,
  QueueStatsDto,
  QueueSettingsResponseDto,
} from './dto/queue-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('queue')
@ApiBearerAuth()
@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('entries')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: "Liste des entrées de la file d'attente" })
  findAll(
    @Query() query: QueueQueryDto,
  ): Promise<QueueEntryResponseDto[]> {
    return this.queueService.findAll(query);
  }

  @Get('stats')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Statistiques de la file d'attente" })
  getStats(): Promise<QueueStatsDto> {
    return this.queueService.getStats();
  }

  @Post('check-in')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Enregistrer l'arrivée d'un patient" })
  checkIn(@Body() checkInDto: CheckInDto): Promise<QueueEntryResponseDto> {
    return this.queueService.checkIn(checkInDto);
  }

  @Patch('entries/:id/status')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: "Mettre à jour le statut d'une entrée" })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateQueueStatusDto,
  ): Promise<QueueEntryResponseDto> {
    return this.queueService.updateStatus(id, dto);
  }

  @Get('settings')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Récupérer les paramètres de la file d'attente" })
  getSettings(
    @Query('practitioner_id') practitionerId?: string,
    @Query('resource_id') resourceId?: string,
  ): Promise<QueueSettingsResponseDto[]> {
    return this.queueService.getSettings(practitionerId, resourceId);
  }

  @Put('settings')
  @Roles('admin')
  @ApiOperation({
    summary: "Mettre à jour les paramètres globaux de la file d'attente",
  })
  updateSettings(
    @Body() settingsDto: QueueSettingsDto,
  ): Promise<QueueSettingsResponseDto> {
    return this.queueService.updateSettings(settingsDto);
  }
}
