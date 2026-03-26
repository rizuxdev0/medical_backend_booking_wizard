import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  CreateNotificationLogDto,
  NotificationQueryDto,
} from './dto/create-notification.dto';
import {
  NotificationResponseDto,
  NotificationLogResponseDto,
} from './dto/notification-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== NOTIFICATIONS PLANIFIÉES ====================

  @Post()
  @ApiOperation({ summary: 'Créer un log de notification (Interne/UI)' })
  createLog(
    @Body() createLogDto: CreateNotificationLogDto,
  ): Promise<NotificationLogResponseDto> {
    return this.notificationsService.createLog(createLogDto);
  }

  @Post('scheduled')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Créer une notification planifiée' })
  createScheduled(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('scheduled')
  @Roles('admin')
  @ApiOperation({ summary: 'Liste des notifications planifiées' })
  findAllScheduled(
    @Query() query: NotificationQueryDto,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll(query);
  }

  // ==================== LOGS DE NOTIFICATIONS ====================

  @Get()
  @ApiOperation({ summary: 'Liste des notifications (logs) avec filtres' })
  findAllLogs(
    @Query() query: NotificationQueryDto,
    @CurrentUser() user,
  ): Promise<NotificationLogResponseDto[]> {
    // Sécurité: vérifier si user et roles existent
    if (!user || !user.roles) {
      return this.notificationsService.findAllLogs(query);
    }

    // Si l'utilisateur est un patient, filtrer automatiquement
    if (user.roles.includes('patient')) {
      query.patient_id = user.patient_id || user.patientId; 
    }
    if (user.roles.includes('doctor') || user.roles.includes('secretary')) {
      query.user_id = user.id;
    }
    return this.notificationsService.findAllLogs(query);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  async getUnreadCount(@CurrentUser() user): Promise<{ count: number }> {
    if (!user || !user.roles) return { count: 0 };
    // Adapter selon le rôle
    if (user.roles.includes('patient')) {
      return this.notificationsService.getUnreadCount(
        undefined,
        user.patient_id || user.patientId,
      );
    }
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  markAsRead(@Param('id') id: string): Promise<NotificationLogResponseDto> {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  async markAllAsRead(@CurrentUser() user): Promise<{ message: string }> {
    if (!user || !user.roles) return { message: 'Aucun utilisateur authentifié' };
    if (user.roles.includes('patient')) {
      return this.notificationsService.markAllAsRead(undefined, user.patient_id || user.patientId);
    }
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.notificationsService.delete(id);
    return { message: 'Notification supprimée' };
  }

  @Delete('all/clear')
  @ApiOperation({ summary: 'Supprimer TOUTES les notifications' })
  async clearAll(@CurrentUser() user): Promise<{ message: string }> {
    if (!user || !user.roles) return { message: 'Utilisateur non trouvé' };
    if (user.roles.includes('patient')) {
      await this.notificationsService.clearAll(undefined, user.patient_id || user.patientId);
    } else {
      await this.notificationsService.clearAll(user.id);
    }
    return { message: 'Toutes les notifications ont été supprimées' };
  }
}
