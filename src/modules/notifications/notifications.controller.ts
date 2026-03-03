// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Query,
//   UseGuards,
// } from '@nestjs/common';
// import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
// import { NotificationsService } from './notifications.service';
// import {
//   CreateNotificationDto,
//   CreateNotificationLogDto,
//   NotificationQueryDto,
// } from './dto/create-notification.dto';
// import {
//   NotificationResponseDto,
//   NotificationLogResponseDto,
// } from './dto/notification-response.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';

// @ApiTags('notifications')
// @ApiBearerAuth()
// @Controller('notifications')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class NotificationsController {
//   constructor(private readonly notificationsService: NotificationsService) {}

//   // ==================== NOTIFICATIONS PLANIFIÉES ====================

//   @Post()
//   @Roles('admin', 'doctor', 'secretary')
//   @ApiOperation({ summary: 'Créer une notification planifiée' })
//   create(
//     @Body() createNotificationDto: CreateNotificationDto,
//   ): Promise<NotificationResponseDto> {
//     return this.notificationsService.create(createNotificationDto);
//   }

//   @Get('scheduled')
//   @Roles('admin')
//   @ApiOperation({ summary: 'Liste des notifications planifiées' })
//   findAll(
//     @Query() query: NotificationQueryDto,
//   ): Promise<NotificationResponseDto[]> {
//     return this.notificationsService.findAll(query);
//   }

//   @Get('scheduled/:id')
//   @Roles('admin')
//   @ApiOperation({ summary: "Détail d'une notification planifiée" })
//   findOne(@Param('id') id: string): Promise<NotificationResponseDto> {
//     return this.notificationsService.findOne(id);
//   }

//   // ==================== LOGS DE NOTIFICATIONS ====================

//   @Get('logs')
//   @ApiOperation({ summary: 'Liste des notifications (logs)' })
//   findAllLogs(
//     @Query() query: NotificationQueryDto,
//     @CurrentUser() user,
//   ): Promise<NotificationLogResponseDto[]> {
//     // Si l'utilisateur est un patient, filtrer par son patient_id
//     if (user.roles.includes('patient')) {
//       // Il faudrait récupérer le patient_id associé à l'utilisateur
//       // Pour l'instant, on passe
//     }
//     return this.notificationsService.findAllLogs(query);
//   }

//   @Get('logs/unread/count')
//   @ApiOperation({ summary: 'Nombre de notifications non lues' })
//   async getUnreadCount(@CurrentUser() user): Promise<{ count: number }> {
//     // Adapter selon le rôle
//     return this.notificationsService.getUnreadCount(user.id);
//   }

//   @Patch('logs/:id/read')
//   @ApiOperation({ summary: 'Marquer une notification comme lue' })
//   markAsRead(@Param('id') id: string): Promise<NotificationLogResponseDto> {
//     return this.notificationsService.markAsRead(id);
//   }

//   @Patch('logs/read-all')
//   @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
//   markAllAsRead(@CurrentUser() user): Promise<{ message: string }> {
//     return this.notificationsService.markAllAsRead(user.id);
//   }
// }
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
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
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Créer une notification planifiée' })
  create(
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
    // Si l'utilisateur est un patient, filtrer automatiquement
    if (user.roles.includes('patient')) {
      query.patient_id = user.patientId; // À adapter selon votre logique
    }
    if (user.roles.includes('doctor') || user.roles.includes('secretary')) {
      query.user_id = user.id;
    }
    return this.notificationsService.findAllLogs(query);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  async getUnreadCount(@CurrentUser() user): Promise<{ count: number }> {
    // Adapter selon le rôle
    if (user.roles.includes('patient')) {
      return this.notificationsService.getUnreadCount(
        undefined,
        user.patientId,
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
    if (user.roles.includes('patient')) {
      return this.notificationsService.markAllAsRead(undefined, user.patientId);
    }
    return this.notificationsService.markAllAsRead(user.id);
  }
}
