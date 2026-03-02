import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationLog } from './entities/notification-log.entity';
import {
  CreateNotificationDto,
  CreateNotificationLogDto,
  NotificationQueryDto,
} from './dto/create-notification.dto';
import {
  NotificationResponseDto,
  NotificationLogResponseDto,
} from './dto/notification-response.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Profile } from '../users/entities/profile.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationLog)
    private logRepo: Repository<NotificationLog>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  // ==================== NOTIFICATIONS PLANIFIÉES ====================

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: createNotificationDto.appointment_id },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    const notification = this.notificationRepo.create({
      appointmentId: createNotificationDto.appointment_id,
      type: createNotificationDto.type as any,
      scheduledFor: new Date(createNotificationDto.scheduled_for),
      status: 'pending',
    });

    await this.notificationRepo.save(notification);
    return this.mapToResponse(notification);
  }

  async findAll(
    query: NotificationQueryDto,
  ): Promise<NotificationResponseDto[]> {
    const whereCondition: any = {};

    if (query.status) {
      whereCondition.status = query.status;
    }

    const notifications = await this.notificationRepo.find({
      where: whereCondition,
      order: { scheduledFor: 'ASC' },
      relations: ['appointment'],
    });

    return notifications.map((n) => this.mapToResponse(n));
  }

  async findOne(id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: ['appointment'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return this.mapToResponse(notification);
  }

  async markAsSent(id: string): Promise<NotificationResponseDto> {
    await this.notificationRepo.update(id, {
      status: 'sent',
      sentAt: new Date(),
    });

    return this.findOne(id);
  }

  async markAsFailed(
    id: string,
    errorMessage: string,
  ): Promise<NotificationResponseDto> {
    await this.notificationRepo.update(id, {
      status: 'failed',
      errorMessage,
    });

    return this.findOne(id);
  }

  // ==================== LOGS DE NOTIFICATIONS ====================

  async createLog(
    createLogDto: CreateNotificationLogDto,
  ): Promise<NotificationLogResponseDto> {
    const logData: Partial<NotificationLog> = {
      type: createLogDto.type,
      title: createLogDto.title,
      message: createLogDto.message,
      data: createLogDto.data || {},
    };

    if (createLogDto.user_id) {
      const user = await this.profileRepo.findOne({
        where: { id: createLogDto.user_id },
      });
      if (user) {
        logData.userId = createLogDto.user_id;
      }
    }

    if (createLogDto.patient_id) {
      const patient = await this.patientRepo.findOne({
        where: { id: createLogDto.patient_id },
      });
      if (patient) {
        logData.patientId = createLogDto.patient_id;
      }
    }

    const log = this.logRepo.create(logData);
    await this.logRepo.save(log);

    return this.mapLogToResponse(log);
  }

  async findAllLogs(
    query: NotificationQueryDto,
  ): Promise<NotificationLogResponseDto[]> {
    const whereCondition: any = {};

    if (query.user_id) {
      whereCondition.userId = query.user_id;
    }

    if (query.patient_id) {
      whereCondition.patientId = query.patient_id;
    }

    if (query.is_read !== undefined) {
      whereCondition.isRead = query.is_read === 'true';
    }

    const logs = await this.logRepo.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      relations: ['user', 'patient'],
      take: 50,
    });

    return logs.map((l) => this.mapLogToResponse(l));
  }

  async markAsRead(id: string): Promise<NotificationLogResponseDto> {
    await this.logRepo.update(id, { isRead: true });

    const log = await this.logRepo.findOne({
      where: { id },
      relations: ['user', 'patient'],
    });

    if (!log) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return this.mapLogToResponse(log);
  }
  async markAllAsRead(
    userId?: string,
    patientId?: string,
  ): Promise<{ message: string }> {
    const whereCondition: any = { isRead: false };

    if (userId) {
      whereCondition.userId = userId;
    }

    if (patientId) {
      whereCondition.patientId = patientId;
    }

    await this.logRepo.update(whereCondition, { isRead: true });

    return { message: 'Toutes les notifications ont été marquées comme lues' };
  }

  async getUnreadCount(
    userId?: string,
    patientId?: string,
  ): Promise<{ count: number }> {
    const whereCondition: any = { isRead: false };

    if (userId) {
      whereCondition.userId = userId;
    }

    if (patientId) {
      whereCondition.patientId = patientId;
    }

    const count = await this.logRepo.count({ where: whereCondition });

    return { count };
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private mapToResponse(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      appointment_id: notification.appointmentId,
      type: notification.type,
      status: notification.status,
      scheduled_for: notification.scheduledFor,
      sent_at: notification.sentAt || null,
      error_message: notification.errorMessage || null,
      created_at: notification.createdAt,
    };
  }

  private mapLogToResponse(log: NotificationLog): NotificationLogResponseDto {
    const response: NotificationLogResponseDto = {
      id: log.id,
      user_id: log.userId || null,
      patient_id: log.patientId || null,
      type: log.type,
      title: log.title,
      message: log.message,
      data: log.data,
      is_read: log.isRead,
      created_at: log.createdAt,
    };

    if (log.user) {
      response.user = {
        id: log.user.id,
        email: log.user.email,
        first_name: log.user.first_name || null,
        last_name: log.user.last_name || null,
      };
    }

    if (log.patient) {
      response.patient = {
        id: log.patient.id,
        first_name: log.patient.firstName,
        last_name: log.patient.lastName,
        phone: log.patient.phone || null,
      };
    }

    return response;
  }
}
