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
  Like,
} from 'typeorm';
import { Resource } from './entities/resource.entity';
import { ResourceSchedule } from './entities/resource-schedule.entity';
import { ResourceBooking } from './entities/resource-booking.entity';
import { ResourceMaintenanceLog } from './entities/resource-maintenance-log.entity';
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
import { Practitioner } from '../practitioners/entities/practitioner.entity';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepo: Repository<Resource>,
    @InjectRepository(ResourceSchedule)
    private scheduleRepo: Repository<ResourceSchedule>,
    @InjectRepository(ResourceBooking)
    private bookingRepo: Repository<ResourceBooking>,
    @InjectRepository(ResourceMaintenanceLog)
    private maintenanceRepo: Repository<ResourceMaintenanceLog>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
  ) {}

  // ==================== CRUD RESSOURCES ====================

  async findAll(query: ResourceQueryDto): Promise<ResourceResponseDto[]> {
    const { type, is_available, location, search } = query;

    const whereCondition: any = {};

    if (type) {
      whereCondition.type = type;
    }

    if (is_available !== undefined) {
      whereCondition.isAvailable = is_available;
    }

    if (location) {
      whereCondition.location = location;
    }

    if (search) {
      whereCondition.name = Like(`%${search}%`);
    }

    const resources = await this.resourceRepo.find({
      where: whereCondition,
      order: { name: 'ASC' },
    });

    return resources.map((r) => this.mapToResponse(r));
  }

  async findOne(id: string): Promise<ResourceResponseDto> {
    const resource = await this.resourceRepo.findOne({
      where: { id },
      relations: ['schedules'],
    });

    if (!resource) {
      throw new NotFoundException(`Ressource avec l'ID ${id} non trouvée`);
    }

    return this.mapToResponse(resource);
  }

  async create(
    createResourceDto: CreateResourceDto,
  ): Promise<ResourceResponseDto> {
    // Vérifier si le numéro de série existe déjà (pour les équipements)
    if (createResourceDto.serial_number) {
      const existing = await this.resourceRepo.findOne({
        where: { serialNumber: createResourceDto.serial_number },
      });
      if (existing) {
        throw new BadRequestException(
          'Un équipement avec ce numéro de série existe déjà',
        );
      }
    }

    // Vérifier le praticien assigné si fourni
    if (createResourceDto.assigned_practitioner_id) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: createResourceDto.assigned_practitioner_id },
      });
      if (!practitioner) {
        throw new NotFoundException('Praticien non trouvé');
      }
    }

    const resourceData: Partial<Resource> = {
      name: createResourceDto.name,
      type: createResourceDto.type,
    };

    const fieldMappings = {
      description: 'description',
      location: 'location',
      floor: 'floor',
      capacity: 'capacity',
      is_available: 'isAvailable',
      maintenance_required: 'maintenanceRequired',
      assigned_practitioner_id: 'assignedPractitionerId',
      manufacturer: 'manufacturer',
      model: 'model',
      serial_number: 'serialNumber',
      purchase_date: 'purchaseDate',
      warranty_expiry_date: 'warrantyExpiryDate',
      last_maintenance_date: 'lastMaintenanceDate',
      next_maintenance_date: 'nextMaintenanceDate',
      cost_per_hour: 'costPerHour',
      contact_person: 'contactPerson',
      contact_phone: 'contactPhone',
      image_url: 'imageUrl',
      notes: 'notes',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (createResourceDto[snakeField] !== undefined) {
        resourceData[camelField] = createResourceDto[snakeField];
      }
    });

    const resource = this.resourceRepo.create(resourceData);
    await this.resourceRepo.save(resource);

    return this.mapToResponse(resource);
  }

  async update(
    id: string,
    updateResourceDto: UpdateResourceDto,
  ): Promise<ResourceResponseDto> {
    const resource = await this.resourceRepo.findOne({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`Ressource avec l'ID ${id} non trouvée`);
    }

    // Vérifier le numéro de série si modifié
    if (
      updateResourceDto.serial_number &&
      updateResourceDto.serial_number !== resource.serialNumber
    ) {
      const existing = await this.resourceRepo.findOne({
        where: { serialNumber: updateResourceDto.serial_number },
      });
      if (existing) {
        throw new BadRequestException(
          'Un équipement avec ce numéro de série existe déjà',
        );
      }
    }

    // Vérifier le praticien assigné si modifié
    if (updateResourceDto.assigned_practitioner_id) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: updateResourceDto.assigned_practitioner_id },
      });
      if (!practitioner) {
        throw new NotFoundException('Praticien non trouvé');
      }
    }

    const updateData: Partial<Resource> = {};

    const fieldMappings = {
      name: 'name',
      type: 'type',
      description: 'description',
      location: 'location',
      floor: 'floor',
      capacity: 'capacity',
      is_available: 'isAvailable',
      maintenance_required: 'maintenanceRequired',
      assigned_practitioner_id: 'assignedPractitionerId',
      manufacturer: 'manufacturer',
      model: 'model',
      serial_number: 'serialNumber',
      purchase_date: 'purchaseDate',
      warranty_expiry_date: 'warrantyExpiryDate',
      last_maintenance_date: 'lastMaintenanceDate',
      next_maintenance_date: 'nextMaintenanceDate',
      cost_per_hour: 'costPerHour',
      contact_person: 'contactPerson',
      contact_phone: 'contactPhone',
      image_url: 'imageUrl',
      notes: 'notes',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (updateResourceDto[snakeField] !== undefined) {
        updateData[camelField] = updateResourceDto[snakeField];
      }
    });

    if (Object.keys(updateData).length > 0) {
      await this.resourceRepo.update(id, updateData);
    }

    const updatedResource = await this.resourceRepo.findOne({
      where: { id },
      relations: ['schedules'],
    });

    if (!updatedResource) {
      throw new NotFoundException(
        `Ressource avec l'ID ${id} non trouvée après mise à jour`,
      );
    }

    return this.mapToResponse(updatedResource);
  }

  // ==================== GESTION DES HORAIRES ====================

  async getSchedules(
    resourceId: string,
  ): Promise<ResourceScheduleResponseDto[]> {
    const resource = await this.resourceRepo.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(
        `Ressource avec l'ID ${resourceId} non trouvée`,
      );
    }

    const schedules = await this.scheduleRepo.find({
      where: { resourceId },
      order: { dayOfWeek: 'ASC' },
    });

    return schedules.map((s) => this.mapScheduleToResponse(s));
  }

  async updateSchedules(
    resourceId: string,
    schedules: CreateResourceScheduleDto[],
  ): Promise<ResourceScheduleResponseDto[]> {
    const resource = await this.resourceRepo.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(
        `Ressource avec l'ID ${resourceId} non trouvée`,
      );
    }

    // Supprimer les anciens horaires
    await this.scheduleRepo.delete({ resourceId });

    // Créer les nouveaux horaires
    const newSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        const scheduleData: Partial<ResourceSchedule> = {
          resourceId,
          dayOfWeek: schedule.day_of_week,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          isAvailable:
            schedule.is_available !== undefined ? schedule.is_available : true,
        };

        const newSchedule = this.scheduleRepo.create(scheduleData);
        return this.scheduleRepo.save(newSchedule);
      }),
    );

    return newSchedules.map((s) => this.mapScheduleToResponse(s));
  }

  // ==================== GESTION DES RÉSERVATIONS ====================

  async getBookings(
    resourceId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ResourceBookingResponseDto[]> {
    const resource = await this.resourceRepo.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(
        `Ressource avec l'ID ${resourceId} non trouvée`,
      );
    }

    const whereCondition: any = { resourceId };

    if (dateFrom || dateTo) {
      whereCondition.startTime = Between(
        dateFrom ? new Date(dateFrom) : new Date('1900-01-01'),
        dateTo ? new Date(dateTo) : new Date('2100-12-31'),
      );
    }

    const bookings = await this.bookingRepo.find({
      where: whereCondition,
      order: { startTime: 'ASC' },
    });

    return bookings.map((b) => this.mapBookingToResponse(b));
  }

  async createBooking(
    resourceId: string,
    createBookingDto: CreateResourceBookingDto,
  ): Promise<ResourceBookingResponseDto> {
    const resource = await this.resourceRepo.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(
        `Ressource avec l'ID ${resourceId} non trouvée`,
      );
    }

    // Vérifier la disponibilité
    await this.checkAvailability(
      resourceId,
      new Date(createBookingDto.start_time),
      new Date(createBookingDto.end_time),
    );

    // Vérifier le praticien si fourni
    if (createBookingDto.practitioner_id) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: createBookingDto.practitioner_id },
      });
      if (!practitioner) {
        throw new NotFoundException('Praticien non trouvé');
      }
    }

    const bookingData: Partial<ResourceBooking> = {
      resourceId,
      startTime: new Date(createBookingDto.start_time),
      endTime: new Date(createBookingDto.end_time),
      notes: createBookingDto.notes,
    };

    if (createBookingDto.practitioner_id) {
      bookingData.practitionerId = createBookingDto.practitioner_id;
    }

    if (createBookingDto.appointment_id) {
      bookingData.appointmentId = createBookingDto.appointment_id;
    }

    const booking = this.bookingRepo.create(bookingData);
    await this.bookingRepo.save(booking);

    const savedBooking = await this.bookingRepo.findOne({
      where: { id: booking.id },
    });

    if (!savedBooking) {
      throw new NotFoundException('Réservation non trouvée après création');
    }

    return this.mapBookingToResponse(savedBooking);
  }

  // ==================== GESTION DE LA MAINTENANCE ====================

  async getMaintenanceLogs(
    resourceId: string,
  ): Promise<MaintenanceLogResponseDto[]> {
    const resource = await this.resourceRepo.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(
        `Ressource avec l'ID ${resourceId} non trouvée`,
      );
    }

    const logs = await this.maintenanceRepo.find({
      where: { resourceId },
      order: { maintenanceDate: 'DESC' },
    });

    return logs.map((l) => this.mapMaintenanceToResponse(l));
  }

  async addMaintenanceLog(
    resourceId: string,
    createMaintenanceDto: CreateMaintenanceLogDto,
  ): Promise<MaintenanceLogResponseDto> {
    const resource = await this.resourceRepo.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(
        `Ressource avec l'ID ${resourceId} non trouvée`,
      );
    }

    const logData: Partial<ResourceMaintenanceLog> = {
      resourceId,
      maintenanceType: createMaintenanceDto.maintenance_type,
    };

    if (createMaintenanceDto.description) {
      logData.description = createMaintenanceDto.description;
    }

    if (createMaintenanceDto.maintenance_date) {
      logData.maintenanceDate = createMaintenanceDto.maintenance_date;
    }

    if (createMaintenanceDto.next_scheduled_date) {
      logData.nextScheduledDate = createMaintenanceDto.next_scheduled_date;
    }

    if (createMaintenanceDto.performed_by) {
      logData.performedBy = createMaintenanceDto.performed_by;
    }

    if (createMaintenanceDto.cost !== undefined) {
      logData.cost = createMaintenanceDto.cost;
    }

    if (createMaintenanceDto.status) {
      logData.status = createMaintenanceDto.status;
    }

    if (createMaintenanceDto.notes) {
      logData.notes = createMaintenanceDto.notes;
    }

    const log = this.maintenanceRepo.create(logData);
    await this.maintenanceRepo.save(log);

    // Mettre à jour le statut de maintenance de la ressource
    if (
      createMaintenanceDto.status === 'in_progress' ||
      createMaintenanceDto.status === 'planned'
    ) {
      await this.resourceRepo.update(resourceId, {
        maintenanceRequired: true,
      });
    } else if (createMaintenanceDto.status === 'completed') {
      await this.resourceRepo.update(resourceId, {
        maintenanceRequired: false,
        lastMaintenanceDate:
          createMaintenanceDto.maintenance_date ||
          new Date().toISOString().split('T')[0],
        nextMaintenanceDate: createMaintenanceDto.next_scheduled_date,
      });
    }

    return this.mapMaintenanceToResponse(log);
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private async checkAvailability(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ): Promise<void> {
    // Vérifier les réservations conflictuelles
    const queryBuilder = this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.resource_id = :resourceId', { resourceId })
      .andWhere('booking.start_time < :endTime', { endTime })
      .andWhere('booking.end_time > :startTime', { startTime });

    if (excludeBookingId) {
      queryBuilder.andWhere('booking.id != :excludeId', {
        excludeId: excludeBookingId,
      });
    }

    const conflictingBookings = await queryBuilder.getMany();

    if (conflictingBookings.length > 0) {
      throw new BadRequestException(
        'La ressource est déjà réservée sur cette période',
      );
    }

    // Vérifier les horaires d'ouverture
    const dayOfWeek = startTime.getDay();
    const timeStr = startTime.toTimeString().split(' ')[0].substring(0, 5);

    const schedule = await this.scheduleRepo.findOne({
      where: {
        resourceId,
        dayOfWeek,
        isAvailable: true,
        startTime: LessThanOrEqual(timeStr),
        endTime: MoreThanOrEqual(
          endTime.toTimeString().split(' ')[0].substring(0, 5),
        ),
      },
    });

    if (!schedule) {
      throw new BadRequestException(
        "La ressource n'est pas disponible à cette heure",
      );
    }
  }

  private mapToResponse(resource: Resource): ResourceResponseDto {
    return {
      id: resource.id,
      name: resource.name,
      type: resource.type,
      description: resource.description || null,
      location: resource.location || null,
      floor: resource.floor || null,
      capacity: resource.capacity || null,
      is_available: resource.isAvailable,
      maintenance_required: resource.maintenanceRequired,
      assigned_practitioner_id: resource.assignedPractitionerId || null,
      manufacturer: resource.manufacturer || null,
      model: resource.model || null,
      serial_number: resource.serialNumber || null,
      purchase_date: resource.purchaseDate || null,
      warranty_expiry_date: resource.warrantyExpiryDate || null,
      last_maintenance_date: resource.lastMaintenanceDate || null,
      next_maintenance_date: resource.nextMaintenanceDate || null,
      cost_per_hour: resource.costPerHour,
      contact_person: resource.contactPerson || null,
      contact_phone: resource.contactPhone || null,
      image_url: resource.imageUrl || null,
      notes: resource.notes || null,
      created_at: resource.createdAt,
      updated_at: resource.updatedAt,
    };
  }

  private mapScheduleToResponse(
    schedule: ResourceSchedule,
  ): ResourceScheduleResponseDto {
    return {
      id: schedule.id,
      resource_id: schedule.resourceId,
      day_of_week: schedule.dayOfWeek,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      is_available: schedule.isAvailable,
      created_at: schedule.createdAt,
    };
  }

  private mapBookingToResponse(
    booking: ResourceBooking,
  ): ResourceBookingResponseDto {
    return {
      id: booking.id,
      resource_id: booking.resourceId,
      practitioner_id: booking.practitionerId || null,
      appointment_id: booking.appointmentId || null,
      start_time: booking.startTime,
      end_time: booking.endTime,
      notes: booking.notes || null,
      created_at: booking.createdAt,
    };
  }

  private mapMaintenanceToResponse(
    log: ResourceMaintenanceLog,
  ): MaintenanceLogResponseDto {
    return {
      id: log.id,
      resource_id: log.resourceId,
      maintenance_type: log.maintenanceType,
      description: log.description || null,
      maintenance_date: log.maintenanceDate,
      next_scheduled_date: log.nextScheduledDate || null,
      performed_by: log.performedBy || null,
      cost: log.cost,
      status: log.status,
      notes: log.notes || null,
      created_at: log.createdAt,
      updated_at: log.updatedAt,
    };
  }
}
