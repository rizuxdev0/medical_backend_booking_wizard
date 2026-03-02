import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  In,
} from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentType } from './entities/appointment-type.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { PractitionerSchedule } from '../practitioners/entities/practitioner-schedule.entity';
import { PractitionerAbsence } from '../practitioners/entities/practitioner-absence.entity';
import { Resource } from '../resources/entities/resource.entity';

type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(AppointmentType)
    private appointmentTypeRepo: Repository<AppointmentType>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
    @InjectRepository(PractitionerSchedule)
    private scheduleRepo: Repository<PractitionerSchedule>,
    @InjectRepository(PractitionerAbsence)
    private absenceRepo: Repository<PractitionerAbsence>,
    @InjectRepository(Resource)
    private resourceRepo: Repository<Resource>,
  ) {}

  // ==================== LISTE AVEC FILTRES ====================

  async findAll(
    query: AppointmentQueryDto,
  ): Promise<{ data: AppointmentResponseDto[]; meta: any }> {
    const {
      status,
      practitioner_id,
      patient_id,
      date_from,
      date_to,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }

    if (practitioner_id) {
      whereCondition.practitionerId = practitioner_id;
    }

    if (patient_id) {
      whereCondition.patientId = patient_id;
    }

    if (date_from || date_to) {
      whereCondition.scheduledAt = Between(
        date_from ? new Date(date_from) : new Date('1900-01-01'),
        date_to ? new Date(date_to) : new Date('2100-12-31'),
      );
    }

    const [appointments, total] = await this.appointmentRepo.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { scheduledAt: 'DESC' },
      relations: ['patient', 'practitioner', 'appointmentType', 'resource'],
    });

    return {
      data: appointments.map((apt) => this.mapToResponse(apt)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== DÉTAIL ====================

  async findOne(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: [
        'patient',
        'practitioner',
        'appointmentType',
        'resource',
        'creator',
      ],
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    return this.mapToResponse(appointment);
  }

  // ==================== CRÉATION ====================

  async create(
    createAppointmentDto: CreateAppointmentDto,
    createdBy: string,
  ): Promise<AppointmentResponseDto> {
    // 1. Vérifier que le patient existe
    const patient = await this.patientRepo.findOne({
      where: { id: createAppointmentDto.patient_id },
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient avec l'ID ${createAppointmentDto.patient_id} non trouvé`,
      );
    }

    // 2. Vérifier que le praticien existe
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: createAppointmentDto.practitioner_id },
    });
    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${createAppointmentDto.practitioner_id} non trouvé`,
      );
    }

    // 3. Vérifier la disponibilité du praticien
    await this.checkPractitionerAvailability(
      createAppointmentDto.practitioner_id,
      new Date(createAppointmentDto.scheduled_at),
      createAppointmentDto.duration_minutes || 30,
    );

    // 4. Vérifier les conflits d'horaire
    await this.checkConflicts(
      createAppointmentDto.practitioner_id,
      new Date(createAppointmentDto.scheduled_at),
      createAppointmentDto.duration_minutes || 30,
    );

    // 5. Vérifier la ressource si fournie
    if (createAppointmentDto.resource_id) {
      const resource = await this.resourceRepo.findOne({
        where: { id: createAppointmentDto.resource_id },
      });
      if (!resource) {
        throw new NotFoundException(
          `Ressource avec l'ID ${createAppointmentDto.resource_id} non trouvée`,
        );
      }
      // Vérifier la disponibilité de la ressource (à implémenter)
    }

    // 6. Récupérer le type de rendez-vous si fourni
    if (createAppointmentDto.appointment_type_id) {
      const appointmentType = await this.appointmentTypeRepo.findOne({
        where: { id: createAppointmentDto.appointment_type_id },
      });
      if (!appointmentType) {
        throw new NotFoundException(
          `Type de rendez-vous avec l'ID ${createAppointmentDto.appointment_type_id} non trouvé`,
        );
      }
    }

    // 7. Créer le rendez-vous
    const appointmentData: Partial<Appointment> = {
      patientId: createAppointmentDto.patient_id,
      practitionerId: createAppointmentDto.practitioner_id,
      scheduledAt: new Date(createAppointmentDto.scheduled_at),
      durationMinutes: createAppointmentDto.duration_minutes || 30,
      notes: createAppointmentDto.notes,
      createdBy,
      status: 'pending',
    };

    if (createAppointmentDto.appointment_type_id) {
      appointmentData.appointmentTypeId =
        createAppointmentDto.appointment_type_id;
    }

    if (createAppointmentDto.resource_id) {
      appointmentData.resourceId = createAppointmentDto.resource_id;
    }

    const appointment = this.appointmentRepo.create(appointmentData);
    await this.appointmentRepo.save(appointment);

    // 8. Logger l'activité (sera implémenté dans la phase 11)
    // this.activityLogService.log('create', 'appointment', appointment.id, null, appointment, createdBy);

    // 9. Créer une notification (sera implémenté dans la phase 11)
    // this.notificationService.create(appointment.id, 'confirmation', appointment.scheduledAt);

    // 10. Récupérer le rendez-vous avec ses relations
    const savedAppointment = await this.appointmentRepo.findOne({
      where: { id: appointment.id },
      relations: ['patient', 'practitioner', 'appointmentType', 'resource'],
    });

    if (!savedAppointment) {
      throw new NotFoundException('Rendez-vous créé mais non trouvé');
    }

    return this.mapToResponse(savedAppointment);
  }

  // ==================== MODIFICATION ====================

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    // Empêcher la modification des rendez-vous passés ou terminés
    if (
      appointment.status === 'completed' ||
      appointment.status === 'cancelled' ||
      appointment.status === 'no_show'
    ) {
      throw new BadRequestException(
        `Impossible de modifier un rendez-vous ${appointment.status}`,
      );
    }

    // Préparer les données de mise à jour
    const updateData: Partial<Appointment> = {};

    if (updateAppointmentDto.patient_id) {
      const patient = await this.patientRepo.findOne({
        where: { id: updateAppointmentDto.patient_id },
      });
      if (!patient) throw new NotFoundException('Patient non trouvé');
      updateData.patientId = updateAppointmentDto.patient_id;
    }

    if (updateAppointmentDto.practitioner_id) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: updateAppointmentDto.practitioner_id },
      });
      if (!practitioner) throw new NotFoundException('Praticien non trouvé');
      updateData.practitionerId = updateAppointmentDto.practitioner_id;
    }

    if (updateAppointmentDto.scheduled_at) {
      // Vérifier la disponibilité pour la nouvelle date
      await this.checkPractitionerAvailability(
        updateAppointmentDto.practitioner_id || appointment.practitionerId,
        new Date(updateAppointmentDto.scheduled_at),
        updateAppointmentDto.duration_minutes || appointment.durationMinutes,
      );
      updateData.scheduledAt = new Date(updateAppointmentDto.scheduled_at);
    }

    if (updateAppointmentDto.duration_minutes) {
      updateData.durationMinutes = updateAppointmentDto.duration_minutes;
    }

    if (updateAppointmentDto.appointment_type_id !== undefined) {
      if (updateAppointmentDto.appointment_type_id) {
        const appointmentType = await this.appointmentTypeRepo.findOne({
          where: { id: updateAppointmentDto.appointment_type_id },
        });
        if (!appointmentType) {
          throw new NotFoundException('Type de rendez-vous non trouvé');
        }
      }
      updateData.appointmentTypeId = updateAppointmentDto.appointment_type_id;
    }

    if (updateAppointmentDto.resource_id !== undefined) {
      if (updateAppointmentDto.resource_id) {
        const resource = await this.resourceRepo.findOne({
          where: { id: updateAppointmentDto.resource_id },
        });
        if (!resource) {
          throw new NotFoundException('Ressource non trouvée');
        }
      }
      updateData.resourceId = updateAppointmentDto.resource_id;
    }

    if (updateAppointmentDto.notes !== undefined) {
      updateData.notes = updateAppointmentDto.notes;
    }

    // Sauvegarder les anciennes données pour le log
    const oldData = { ...appointment };

    if (Object.keys(updateData).length > 0) {
      await this.appointmentRepo.update(id, updateData);
    }

    // Logger l'activité
    // this.activityLogService.log('update', 'appointment', id, oldData, updateData, 'system');

    const updatedAppointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner', 'appointmentType', 'resource'],
    });

    if (!updatedAppointment) {
      throw new NotFoundException(
        `Rendez-vous avec l'ID ${id} non trouvé après mise à jour`,
      );
    }

    return this.mapToResponse(updatedAppointment);
  }

  // ==================== CHANGEMENT DE STATUT ====================

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    // Logique de transition de statut
    const oldStatus = appointment.status;
    const newStatus = updateStatusDto.status as AppointmentStatus;

    // Vérifier les transitions valides
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'no_show'],
      completed: [],
      cancelled: [],
      no_show: [],
    };

    if (!validTransitions[oldStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Transition de ${oldStatus} vers ${newStatus} non autorisée`,
      );
    }

    appointment.status = newStatus;
    await this.appointmentRepo.save(appointment);

    // Logger l'activité
    // this.activityLogService.log('status_change', 'appointment', id, { status: oldStatus }, { status: newStatus }, 'system');

    const updatedAppointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner', 'appointmentType', 'resource'],
    });

    if (!updatedAppointment) {
      throw new NotFoundException(
        `Rendez-vous avec l'ID ${id} non trouvé après mise à jour`,
      );
    }

    return this.mapToResponse(updatedAppointment);
  }

  // ==================== REPLANIFICATION ====================

  async reschedule(
    id: string,
    rescheduleDto: RescheduleDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    // Empêcher la replanification des rendez-vous passés ou terminés
    if (
      appointment.status === 'completed' ||
      appointment.status === 'cancelled' ||
      appointment.status === 'no_show'
    ) {
      throw new BadRequestException(
        `Impossible de replanifier un rendez-vous ${appointment.status}`,
      );
    }

    const newPractitionerId =
      rescheduleDto.practitioner_id || appointment.practitionerId;
    const newDate = new Date(rescheduleDto.scheduled_at);

    // Vérifier la disponibilité
    await this.checkPractitionerAvailability(
      newPractitionerId,
      newDate,
      appointment.durationMinutes,
    );
    await this.checkConflicts(
      newPractitionerId,
      newDate,
      appointment.durationMinutes,
      id,
    );

    // Sauvegarder l'ancienne date pour le log
    const oldDate = appointment.scheduledAt;

    // Mettre à jour
    appointment.scheduledAt = newDate;
    if (rescheduleDto.practitioner_id) {
      appointment.practitionerId = rescheduleDto.practitioner_id;
    }
    appointment.status = 'pending'; // Remettre en pending après replanification

    await this.appointmentRepo.save(appointment);

    // Logger l'activité
    // this.activityLogService.log('reschedule', 'appointment', id, { scheduledAt: oldDate }, { scheduledAt: newDate }, 'system');

    const updatedAppointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner', 'appointmentType', 'resource'],
    });

    if (!updatedAppointment) {
      throw new NotFoundException(
        `Rendez-vous avec l'ID ${id} non trouvé après replanification`,
      );
    }

    return this.mapToResponse(updatedAppointment);
  }

  // ==================== SUPPRESSION ====================

  async remove(id: string): Promise<{ message: string }> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    // Soft delete : on change le statut plutôt que de supprimer
    appointment.status = 'cancelled';
    await this.appointmentRepo.save(appointment);

    // Logger l'activité
    // this.activityLogService.log('cancel', 'appointment', id, null, null, 'system');

    return { message: 'Rendez-vous annulé avec succès' };
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private async checkPractitionerAvailability(
    practitionerId: string,
    date: Date,
    duration: number,
  ): Promise<void> {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // 1. Vérifier les absences
    const absences = await this.absenceRepo.find({
      where: {
        practitionerId,
        startDate: LessThanOrEqual(dateStr),
        endDate: MoreThanOrEqual(dateStr),
      },
    });

    if (absences.length > 0) {
      throw new BadRequestException(
        'Le praticien est en congé/absence à cette date',
      );
    }

    // 2. Vérifier l'horaire du jour
    const schedule = await this.scheduleRepo.findOne({
      where: { practitionerId, dayOfWeek, isAvailable: true },
    });

    if (!schedule) {
      throw new BadRequestException('Le praticien ne travaille pas ce jour');
    }

    // 3. Vérifier que l'heure est dans la plage horaire
    const appointmentTime = date.getHours() * 60 + date.getMinutes();
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (appointmentTime < startTime || appointmentTime + duration > endTime) {
      throw new BadRequestException(
        "L'horaire demandé est en dehors des heures de travail",
      );
    }
  }

  private async checkConflicts(
    practitionerId: string,
    date: Date,
    duration: number,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const startTime = date;
    const endTime = new Date(date.getTime() + duration * 60000);

    // Vérifier les chevauchements
    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .where('appointment.practitioner_id = :practitionerId', {
        practitionerId,
      })
      .andWhere('appointment.status NOT IN (:...statuses)', {
        statuses: ['cancelled', 'no_show'],
      })
      .andWhere('appointment.scheduled_at < :endTime', { endTime })
      .andWhere(
        "(appointment.scheduled_at + (appointment.duration_minutes || ' minutes')::interval) > :startTime",
        { startTime },
      );

    if (excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id != :excludeId', {
        excludeId: excludeAppointmentId,
      });
    }

    const conflictingAppointments = await queryBuilder.getMany();

    if (conflictingAppointments.length > 0) {
      throw new BadRequestException(
        "Conflit d'horaire avec un autre rendez-vous",
      );
    }
  }

  private mapToResponse(appointment: Appointment): AppointmentResponseDto {
    const response: AppointmentResponseDto = {
      id: appointment.id,
      patient_id: appointment.patientId,
      practitioner_id: appointment.practitionerId,
      appointment_type_id: appointment.appointmentTypeId || null,
      resource_id: appointment.resourceId || null,
      scheduled_at: appointment.scheduledAt,
      duration_minutes: appointment.durationMinutes,
      status: appointment.status,
      notes: appointment.notes || null,
      created_by: appointment.createdBy || null,
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
    };

    if (appointment.patient) {
      response.patient = {
        id: appointment.patient.id,
        first_name: appointment.patient.firstName,
        last_name: appointment.patient.lastName,
        phone: appointment.patient.phone || null,
      };
    }

    if (appointment.practitioner) {
      response.practitioner = {
        id: appointment.practitioner.id,
        first_name: appointment.practitioner.firstName || null,
        last_name: appointment.practitioner.lastName || null,
        specialty: appointment.practitioner.specialty,
        calendar_color: appointment.practitioner.calendarColor || '#3B82F6',
      };
    }

    if (appointment.appointmentType) {
      response.appointment_type = {
        id: appointment.appointmentType.id,
        name: appointment.appointmentType.name,
        duration_minutes: appointment.appointmentType.durationMinutes,
        color: appointment.appointmentType.color || '#3B82F6',
      };
    }

    if (appointment.resource) {
      response.resource = {
        id: appointment.resource.id,
        name: appointment.resource.name,
        type: appointment.resource.type,
      };
    }

    return response;
  }
}
