import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, IsNull } from 'typeorm';
import { QueueEntry, QueueStatus } from './entities/queue-entry.entity';
import { QueueSettings } from './entities/queue-settings.entity';
import { CheckInDto } from './dto/check-in.dto';
import { UpdateQueueStatusDto } from './dto/update-status.dto';
import { QueueQueryDto } from './dto/queue-query.dto';
import { QueueSettingsDto } from './dto/queue-settings.dto';
import {
  QueueEntryResponseDto,
  QueueStatsDto,
  QueueSettingsResponseDto,
} from './dto/queue-response.dto';
import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Resource } from '../resources/entities/resource.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntry)
    private queueEntryRepo: Repository<QueueEntry>,
    @InjectRepository(QueueSettings)
    private queueSettingsRepo: Repository<QueueSettings>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Resource)
    private resourceRepo: Repository<Resource>,
  ) {}

  // ==================== LISTE DE LA FILE ====================

  async findAll(
    query: QueueQueryDto,
  ): Promise<QueueEntryResponseDto[]> {
    const {
      status,
      practitioner_id,
      resource_id,
    } = query;

    const whereCondition: any = {};

    if (status) {
      if (status === 'active') {
        whereCondition.status = In(['waiting', 'called', 'in_progress']);
      } else {
        whereCondition.status = status;
      }
    } else {
      whereCondition.status = In(['waiting', 'called', 'in_progress']);
    }

    if (practitioner_id) {
      whereCondition.practitionerId = practitioner_id;
    }

    if (resource_id) {
      whereCondition.resourceId = resource_id;
    }

    const [entries] = await this.queueEntryRepo.findAndCount({
      where: whereCondition,
      order: {
        priority: 'DESC',
        queueNumber: 'ASC',
      },
      relations: ['patient', 'practitioner', 'appointment', 'resource'],
    });

    return Promise.all(
      entries.map(async (entry, index) => {
        const position = index + 1;
        const estimatedWaitTime = await this.calculateEstimatedWaitTime(
          entry,
          index,
        );

        return this.mapToResponse(entry, position, estimatedWaitTime);
      }),
    );
  }

  // ==================== CHECK-IN ====================

  async checkIn(checkInDto: CheckInDto): Promise<QueueEntryResponseDto> {
    // 1. Vérifier que le patient existe
    const patient = await this.patientRepo.findOne({
      where: { id: checkInDto.patient_id },
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient avec l'ID ${checkInDto.patient_id} non trouvé`,
      );
    }

    // 2. Vérifier que le patient n'est pas déjà dans la file
    const existingEntry = await this.queueEntryRepo.findOne({
      where: {
        patientId: checkInDto.patient_id,
        status: In(['waiting', 'called', 'in_progress']),
      },
    });
    if (existingEntry) {
      throw new BadRequestException(
        "Ce patient est déjà dans la file d'attente",
      );
    }

    // 3. Vérifier les limites de la file
    const settings = await this.getGlobalSettings();
    const activeCount = await this.queueEntryRepo.count({
      where: { status: In(['waiting', 'called', 'in_progress']) },
    });

    if (settings?.maxQueueSize && activeCount >= settings.maxQueueSize) {
      throw new BadRequestException("La file d'attente est pleine");
    }

    // 4. Calculer le temps d'attente estimé
    const waitingCount = await this.queueEntryRepo.count({
      where: { status: QueueStatus.WAITING },
    });
    const avgTime = settings?.averageServiceTimeMinutes || 15;
    const estimatedWaitMinutes = waitingCount * avgTime;

    // 5. Créer l'entrée dans la file
    const entryData: Partial<QueueEntry> = {
      patientId: checkInDto.patient_id,
      priority: checkInDto.priority || 0,
      estimatedWaitMinutes,
      status: QueueStatus.WAITING,
      notes: checkInDto.notes,
    };

    if (checkInDto.practitioner_id) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: checkInDto.practitioner_id },
      });
      if (!practitioner) {
        throw new NotFoundException('Praticien non trouvé');
      }
      entryData.practitionerId = checkInDto.practitioner_id;
    }

    if (checkInDto.appointment_id) {
      const appointment = await this.appointmentRepo.findOne({
        where: { id: checkInDto.appointment_id },
      });
      if (!appointment) {
        throw new NotFoundException('Rendez-vous non trouvé');
      }
      entryData.appointmentId = checkInDto.appointment_id;
    }

    if (checkInDto.resource_id) {
      const resource = await this.resourceRepo.findOne({
        where: { id: checkInDto.resource_id },
      });
      if (!resource) {
        throw new NotFoundException('Ressource non trouvée');
      }
      entryData.resourceId = checkInDto.resource_id;
    }

    const entry = this.queueEntryRepo.create(entryData);
    await this.queueEntryRepo.save(entry);

    // 6. Mettre à jour le rendez-vous si existant
    if (checkInDto.appointment_id) {
      await this.appointmentRepo.update(checkInDto.appointment_id, {
        status: 'confirmed',
      });
    }

    // 7. Calculer la position
    const position = await this.getPosition(entry.id);

    return this.mapToResponse(entry, position, estimatedWaitMinutes);
  }

  // ==================== GESTION DES STATUTS ====================

  async call(id: string): Promise<QueueEntryResponseDto> {
    const entry = await this.queueEntryRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner'],
    });

    if (!entry) {
      throw new NotFoundException(`Entrée avec l'ID ${id} non trouvée`);
    }

    if (entry.status !== 'waiting') {
      throw new BadRequestException(
        `Impossible d'appeler un patient avec le statut ${entry.status}`,
      );
    }

    entry.status = QueueStatus.CALLED;
    entry.calledTime = new Date();
    await this.queueEntryRepo.save(entry);

    const position = await this.getPosition(entry.id);
    return this.mapToResponse(entry, position);
  }

  async start(id: string): Promise<QueueEntryResponseDto> {
    const entry = await this.queueEntryRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner'],
    });

    if (!entry) {
      throw new NotFoundException(`Entrée avec l'ID ${id} non trouvée`);
    }

    if (entry.status !== 'called') {
      throw new BadRequestException(
        `Impossible de démarrer un patient avec le statut ${entry.status}`,
      );
    }

    entry.status = QueueStatus.IN_PROGRESS;
    entry.startTime = new Date();
    await this.queueEntryRepo.save(entry);

    const position = await this.getPosition(entry.id);
    return this.mapToResponse(entry, position);
  }

  async complete(id: string): Promise<QueueEntryResponseDto> {
    const entry = await this.queueEntryRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner'],
    });

    if (!entry) {
      throw new NotFoundException(`Entrée avec l'ID ${id} non trouvée`);
    }

    if (entry.status !== 'in_progress') {
      throw new BadRequestException(
        `Impossible de terminer un patient avec le statut ${entry.status}`,
      );
    }

    entry.status = QueueStatus.COMPLETED;
    entry.endTime = new Date();
    await this.queueEntryRepo.save(entry);

    // Mettre à jour le rendez-vous si existant
    if (entry.appointmentId) {
      await this.appointmentRepo.update(entry.appointmentId, {
        status: 'completed',
      });
    }

    const position = await this.getPosition(entry.id);
    return this.mapToResponse(entry, position);
  }

  async cancel(id: string): Promise<QueueEntryResponseDto> {
    const entry = await this.queueEntryRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner'],
    });

    if (!entry) {
      throw new NotFoundException(`Entrée avec l'ID ${id} non trouvée`);
    }

    entry.status = QueueStatus.CANCELLED;
    entry.endTime = new Date();
    await this.queueEntryRepo.save(entry);

    const position = await this.getPosition(entry.id);
    return this.mapToResponse(entry, position);
  }

  async updateStatus(
    id: string,
    dto: UpdateQueueStatusDto,
  ): Promise<QueueEntryResponseDto> {
    console.log(`Updating queue entry ${id} status to:`, dto.status);
    
    const entry = await this.queueEntryRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner'],
    });

    if (!entry) {
      throw new NotFoundException(`Entrée avec l'ID ${id} non trouvée`);
    }

    if (dto.status) {
      entry.status = dto.status;
    }
    if (dto.status === QueueStatus.CALLED && !entry.calledTime) {
      entry.calledTime = new Date();
    } else if (dto.status === QueueStatus.IN_PROGRESS && !entry.startTime) {
      entry.startTime = new Date();
    } else if (
      (dto.status === QueueStatus.COMPLETED ||
        dto.status === QueueStatus.DISCHARGED ||
        dto.status === QueueStatus.CANCELLED ||
        dto.status === QueueStatus.NO_SHOW) &&
      !entry.endTime
    ) {
      entry.endTime = new Date();
    }

    await this.queueEntryRepo.save(entry);

    // Sync with appointment if needed
    if (entry.appointmentId) {
      if (dto.status === QueueStatus.COMPLETED || dto.status === QueueStatus.DISCHARGED) {
        await this.appointmentRepo.update(entry.appointmentId, {
          status: 'completed',
        });
      } else if (dto.status === QueueStatus.NO_SHOW) {
        await this.appointmentRepo.update(entry.appointmentId, {
          status: 'no_show',
        });
      }
    }

    const position = await this.getPosition(entry.id);
    return this.mapToResponse(entry, position);
  }

  // ==================== STATISTIQUES ====================

  async getStats(): Promise<QueueStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waiting = await this.queueEntryRepo.count({
      where: { status: QueueStatus.WAITING },
    });
    const inProgress = await this.queueEntryRepo.count({
      where: { status: QueueStatus.IN_PROGRESS },
    });
    const called = await this.queueEntryRepo.count({
      where: { status: QueueStatus.CALLED },
    });
    const completedToday = await this.queueEntryRepo.count({
      where: {
        status: In([QueueStatus.COMPLETED, QueueStatus.DISCHARGED]),
        endTime: Between(today, new Date()),
      },
    });

    // Calculer le temps d'attente moyen
    const completedEntries = await this.queueEntryRepo.find({
      where: {
        status: In([QueueStatus.COMPLETED, QueueStatus.DISCHARGED]),
        endTime: Between(today, new Date()),
      },
    });

    let totalWaitTime = 0;
    let waitCount = 0;

    for (const entry of completedEntries) {
      if (entry.startTime && entry.checkInTime) {
        const waitTime =
          (entry.startTime.getTime() - entry.checkInTime.getTime()) /
          (1000 * 60);
        totalWaitTime += waitTime;
        waitCount++;
      }
    }

    const averageWaitTime =
      waitCount > 0 ? Math.round(totalWaitTime / waitCount) : 0;

    // Trouver le temps d'attente le plus long
    let longestWait = 0;
    for (const entry of completedEntries) {
      if (entry.startTime && entry.checkInTime) {
        const waitTime =
          (entry.startTime.getTime() - entry.checkInTime.getTime()) /
          (1000 * 60);
        if (waitTime > longestWait) {
          longestWait = waitTime;
        }
      }
    }

    // Statistiques par praticien
    const practitioners = await this.practitionerRepo.find();
    const byPractitioner = {};

    for (const p of practitioners) {
      const waitingForPrac = await this.queueEntryRepo.count({
        where: {
          practitionerId: p.id,
          status: QueueStatus.WAITING,
        },
      });
      const inProgressForPrac = await this.queueEntryRepo.count({
        where: {
          practitionerId: p.id,
          status: QueueStatus.IN_PROGRESS,
        },
      });

      if (waitingForPrac > 0 || inProgressForPrac > 0) {
        byPractitioner[p.id] = {
          name:
            `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.specialty,
          waiting: waitingForPrac,
          in_progress: inProgressForPrac,
        };
      }
    }

    return {
      total_waiting: waiting,
      total_in_progress: inProgress,
      total_called: called,
      total_completed_today: completedToday,
      average_wait_time_minutes: averageWaitTime,
      longest_wait_minutes: longestWait,
      by_practitioner: byPractitioner,
    };
  }

  // ==================== PARAMÈTRES ====================

  async getSettings(
    practitionerId?: string,
    resourceId?: string,
  ): Promise<QueueSettingsResponseDto[]> {
    const whereCondition: any = {};

    if (practitionerId) {
      whereCondition.practitionerId = practitionerId;
    }

    if (resourceId) {
      whereCondition.resourceId = resourceId;
    }

    const settings = await this.queueSettingsRepo.find({
      where: whereCondition,
      relations: ['practitioner', 'resource'],
    });

    return settings.map((s) => this.mapSettingsToResponse(s));
  }

  async getGlobalSettings(): Promise<QueueSettings | null> {
    return this.queueSettingsRepo.findOne({
      where: {
        practitionerId: IsNull(),
        resourceId: IsNull(),
      },
    });
  }

  async updateSettings(
    settingsDto: QueueSettingsDto,
  ): Promise<QueueSettingsResponseDto> {
    const whereCondition: any = {};

    if (settingsDto.practitioner_id) {
      whereCondition.practitionerId = settingsDto.practitioner_id;
    } else {
      whereCondition.practitionerId = IsNull();
    }

    if (settingsDto.resource_id) {
      whereCondition.resourceId = settingsDto.resource_id;
    } else {
      whereCondition.resourceId = IsNull();
    }

    const existingSettings = await this.queueSettingsRepo.findOne({
      where: whereCondition,
    });

    const settingsData: Partial<QueueSettings> = {
      averageServiceTimeMinutes: settingsDto.average_service_time_minutes,
      autoCallEnabled: settingsDto.auto_call_enabled,
      displayPositionToPatient: settingsDto.display_position_to_patient,
    };

    if (settingsDto.max_queue_size !== undefined) {
      settingsData.maxQueueSize = settingsDto.max_queue_size;
    }

    if (settingsDto.practitioner_id) {
      settingsData.practitionerId = settingsDto.practitioner_id;
    }

    if (settingsDto.resource_id) {
      settingsData.resourceId = settingsDto.resource_id;
    }

    let settings: QueueSettings;

    if (existingSettings) {
      await this.queueSettingsRepo.update(existingSettings.id, settingsData);
      const updatedSettings = await this.queueSettingsRepo.findOne({
        where: { id: existingSettings.id },
        relations: ['practitioner', 'resource'],
      });

      if (!updatedSettings) {
        throw new NotFoundException('Paramètres non trouvés après mise à jour');
      }
      settings = updatedSettings;
    } else {
      settings = this.queueSettingsRepo.create(settingsData);
      settings = await this.queueSettingsRepo.save(settings);
    }

    return this.mapSettingsToResponse(settings);
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private async getPosition(entryId: string): Promise<number> {
    const entry = await this.queueEntryRepo.findOne({ where: { id: entryId } });
    if (!entry) return 0;

    const waitingEntries = await this.queueEntryRepo.find({
      where: {
        status: In(['waiting', 'called']),
        practitionerId: entry.practitionerId,
      },
      order: {
        priority: 'DESC',
        queueNumber: 'ASC',
      },
    });

    const index = waitingEntries.findIndex((e) => e.id === entryId);
    return index + 1;
  }

  private async calculateEstimatedWaitTime(
    entry: QueueEntry,
    position: number,
  ): Promise<number> {
    if (entry.status !== 'waiting') {
      return 0;
    }

    let settings: QueueSettings | null = null;

    if (entry.practitionerId) {
      settings = await this.queueSettingsRepo.findOne({
        where: { practitionerId: entry.practitionerId },
      });
    }

    if (!settings) {
      settings = await this.getGlobalSettings();
    }

    const avgTime = settings?.averageServiceTimeMinutes || 15;
    return position * avgTime;
  }

  private mapToResponse(
    entry: QueueEntry,
    position?: number,
    estimatedWaitTime?: number,
  ): QueueEntryResponseDto {
    const response: QueueEntryResponseDto = {
      id: entry.id,
      patient_id: entry.patientId,
      practitioner_id: entry.practitionerId || null,
      appointment_id: entry.appointmentId || null,
      resource_id: entry.resourceId || null,
      queue_number: entry.queueNumber,
      priority: entry.priority,
      status: entry.status,
      check_in_time: entry.checkInTime,
      called_time: entry.calledTime || null,
      start_time: entry.startTime || null,
      end_time: entry.endTime || null,
      estimated_wait_minutes: entry.estimatedWaitMinutes,
      notes: entry.notes || null,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    };

    if (entry.patient) {
      response.patient = {
        id: entry.patient.id,
        first_name: entry.patient.firstName,
        last_name: entry.patient.lastName,
        phone: entry.patient.phone || null,
      };
    }

    if (entry.practitioner) {
      response.practitioner = {
        id: entry.practitioner.id,
        first_name: entry.practitioner.firstName || null,
        last_name: entry.practitioner.lastName || null,
        specialty: entry.practitioner.specialty,
      };
    }

    if (entry.appointment) {
      response.appointment = {
        id: entry.appointment.id,
        scheduled_at: entry.appointment.scheduledAt,
        status: entry.appointment.status,
      };
    }

    if (position !== undefined) {
      response.position = position;
    }

    if (estimatedWaitTime !== undefined) {
      response.estimated_wait_time = `${estimatedWaitTime} min`;
    }

    return response;
  }

  private mapSettingsToResponse(
    settings: QueueSettings,
  ): QueueSettingsResponseDto {
    return {
      id: settings.id,
      practitioner_id: settings.practitionerId || null,
      resource_id: settings.resourceId || null,
      average_service_time_minutes: settings.averageServiceTimeMinutes,
      max_queue_size: settings.maxQueueSize || null,
      auto_call_enabled: settings.autoCallEnabled,
      display_position_to_patient: settings.displayPositionToPatient,
      created_at: settings.createdAt,
      updated_at: settings.updatedAt,
    };
  }
}
