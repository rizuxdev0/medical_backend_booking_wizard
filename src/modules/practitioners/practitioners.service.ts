import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Practitioner } from './entities/practitioner.entity';
import { PractitionerSchedule } from './entities/practitioner-schedule.entity';
import { PractitionerAbsence } from './entities/practitioner-absence.entity';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { UpdatePractitionerDto } from './dto/update-practitioner.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { PractitionerResponseDto } from './dto/practitioner-response.dto';
import { PractitionerGuard } from './entities/practitioner-guard.entity';

@Injectable()
export class PractitionersService {
  constructor(
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
    @InjectRepository(PractitionerSchedule)
    private scheduleRepo: Repository<PractitionerSchedule>,
    @InjectRepository(PractitionerAbsence)
    private absenceRepo: Repository<PractitionerAbsence>,
    @InjectRepository(PractitionerGuard)
    private guardRepo: Repository<PractitionerGuard>, // Maintenant reconnu
  ) {}

  // ==================== CRUD PRINCIPAL ====================

  async findAll(): Promise<PractitionerResponseDto[]> {
    const practitioners = await this.practitionerRepo.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
    return practitioners.map((p) => this.mapToResponse(p));
  }

  async findOne(id: string): Promise<PractitionerResponseDto> {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id },
    });

    if (!practitioner) {
      throw new NotFoundException(`Praticien avec l'ID ${id} non trouvé`);
    }

    return this.mapToResponse(practitioner);
  }

  async create(
    createPractitionerDto: CreatePractitionerDto,
  ): Promise<PractitionerResponseDto> {
    // Vérifier si l'email existe déjà
    if (createPractitionerDto.email) {
      const existing = await this.practitionerRepo.findOne({
        where: { email: createPractitionerDto.email },
      });
      if (existing) {
        throw new BadRequestException(
          'Un praticien avec cet email existe déjà',
        );
      }
    }

    // Mapping des données
    const practitionerData: Partial<Practitioner> = {
      specialty: createPractitionerDto.specialty,
    };

    const fieldMappings = {
      title: 'title',
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'email',
      phone: 'phone',
      bio: 'bio',
      education: 'education',
      license_number: 'licenseNumber',
      consultation_fee: 'consultationFee',
      years_of_experience: 'yearsOfExperience',
      languages: 'languages',
      calendar_color: 'calendarColor',
      profile_image_url: 'profileImageUrl',
      accepts_new_patients: 'acceptsNewPatients',
      max_patients_per_day: 'maxPatientsPerDay',
      appointment_buffer_minutes: 'appointmentBufferMinutes',
      date_of_birth: 'dateOfBirth',
      gender: 'gender',
      nationality: 'nationality',
      address: 'address',
      city: 'city',
      postal_code: 'postalCode',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (createPractitionerDto[snakeField] !== undefined) {
        practitionerData[camelField] = createPractitionerDto[snakeField];
      }
    });

    const practitioner = this.practitionerRepo.create(practitionerData);
    await this.practitionerRepo.save(practitioner);

    return this.mapToResponse(practitioner);
  }

  async update(
    id: string,
    updatePractitionerDto: UpdatePractitionerDto,
  ): Promise<PractitionerResponseDto> {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id },
    });

    if (!practitioner) {
      throw new NotFoundException(`Praticien avec l'ID ${id} non trouvé`);
    }

    // Vérifier l'unicité de l'email
    if (
      updatePractitionerDto.email &&
      updatePractitionerDto.email !== practitioner.email
    ) {
      const existing = await this.practitionerRepo.findOne({
        where: { email: updatePractitionerDto.email },
      });
      if (existing) {
        throw new BadRequestException(
          'Un praticien avec cet email existe déjà',
        );
      }
    }

    // Mapping des données de mise à jour
    const updateData: Partial<Practitioner> = {};

    const fieldMappings = {
      specialty: 'specialty',
      title: 'title',
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'email',
      phone: 'phone',
      bio: 'bio',
      education: 'education',
      license_number: 'licenseNumber',
      consultation_fee: 'consultationFee',
      years_of_experience: 'yearsOfExperience',
      languages: 'languages',
      calendar_color: 'calendarColor',
      profile_image_url: 'profileImageUrl',
      accepts_new_patients: 'acceptsNewPatients',
      max_patients_per_day: 'maxPatientsPerDay',
      appointment_buffer_minutes: 'appointmentBufferMinutes',
      date_of_birth: 'dateOfBirth',
      gender: 'gender',
      nationality: 'nationality',
      address: 'address',
      city: 'city',
      postal_code: 'postalCode',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (updatePractitionerDto[snakeField] !== undefined) {
        updateData[camelField] = updatePractitionerDto[snakeField];
      }
    });

    if (Object.keys(updateData).length > 0) {
      await this.practitionerRepo.update(id, updateData);
    }

    const updatedPractitioner = await this.practitionerRepo.findOne({
      where: { id },
    });

    if (!updatedPractitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${id} non trouvé après mise à jour`,
      );
    }

    return this.mapToResponse(updatedPractitioner);
  }

  // ==================== GESTION DES HORAIRES ====================

  async getSchedules(practitionerId: string): Promise<PractitionerSchedule[]> {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${practitionerId} non trouvé`,
      );
    }

    return this.scheduleRepo.find({
      where: { practitionerId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async updateSchedules(
    practitionerId: string,
    schedules: CreateScheduleDto[],
  ): Promise<PractitionerSchedule[]> {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${practitionerId} non trouvé`,
      );
    }

    // Supprimer les anciens horaires
    await this.scheduleRepo.delete({ practitionerId });

    // Créer les nouveaux horaires
    const newSchedules = schedules.map((schedule) => {
      return this.scheduleRepo.create({
        practitionerId,
        dayOfWeek: schedule.day_of_week,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        isAvailable:
          schedule.is_available !== undefined ? schedule.is_available : true,
      });
    });

    return this.scheduleRepo.save(newSchedules);
  }

  // ==================== GESTION DES ABSENCES ====================

  async getAbsences(practitionerId: string): Promise<PractitionerAbsence[]> {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${practitionerId} non trouvé`,
      );
    }

    return this.absenceRepo.find({
      where: { practitionerId },
      order: { startDate: 'ASC' },
    });
  }

  async addAbsence(
    practitionerId: string,
    createAbsenceDto: CreateAbsenceDto,
  ): Promise<PractitionerAbsence> {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${practitionerId} non trouvé`,
      );
    }

    // Vérifier que la date de fin est après la date de début
    if (
      new Date(createAbsenceDto.end_date) <
      new Date(createAbsenceDto.start_date)
    ) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début',
      );
    }

    const absence = this.absenceRepo.create({
      practitionerId,
      startDate: createAbsenceDto.start_date,
      endDate: createAbsenceDto.end_date,
      reason: createAbsenceDto.reason,
    });

    return this.absenceRepo.save(absence);
  }

  async removeAbsence(
    practitionerId: string,
    absenceId: string,
  ): Promise<{ message: string }> {
    const absence = await this.absenceRepo.findOne({
      where: { id: absenceId, practitionerId },
    });

    if (!absence) {
      throw new NotFoundException(`Absence non trouvée`);
    }

    await this.absenceRepo.remove(absence);
    return { message: 'Absence supprimée avec succès' };
  }

  // ==================== DISPONIBILITÉ ====================

  async getAvailability(practitionerId: string, query: AvailabilityQueryDto) {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${practitionerId} non trouvé`,
      );
    }

    const date = new Date(query.date);
    const dayOfWeek = date.getDay();

    // 1. Vérifier les absences
    const absences = await this.absenceRepo.find({
      where: {
        practitionerId,
        startDate: LessThanOrEqual(query.date),
        endDate: MoreThanOrEqual(query.date),
      },
    });

    if (absences.length > 0) {
      return {
        available: false,
        reason: 'absence',
        message: 'Praticien en congé/absence cette journée',
      };
    }

    // 2. Vérifier l'horaire du jour
    const schedule = await this.scheduleRepo.findOne({
      where: { practitionerId, dayOfWeek, isAvailable: true },
    });

    if (!schedule) {
      return {
        available: false,
        reason: 'no_schedule',
        message: "Pas d'horaire de travail pour ce jour",
      };
    }

    // 3. Vérifier le nombre de patients du jour
    // Cette requête sera complète quand le module appointments sera créé
    // Pour l'instant, on simule
    const todayAppointments = 0; // À remplacer par une vraie requête

    if (
      practitioner.maxPatientsPerDay &&
      todayAppointments >= practitioner.maxPatientsPerDay
    ) {
      return {
        available: false,
        reason: 'max_patients',
        message: 'Nombre maximum de patients atteint pour cette journée',
      };
    }

    return {
      available: true,
      schedule: {
        start_time: schedule.startTime,
        end_time: schedule.endTime,
      },
      message: 'Praticien disponible',
    };
  }

  // ==================== GARDES ====================

  async getGuards(
    practitionerId: string,
    month?: string,
  ): Promise<PractitionerGuard[]> {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${practitionerId} non trouvé`,
      );
    }

    const whereCondition: any = { practitionerId };

    if (month) {
      // Filtrer par mois (format: YYYY-MM)
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
        .toISOString()
        .split('T')[0];

      whereCondition.guardDate = Between(startDate, endDate);
    }

    return this.guardRepo.find({
      where: whereCondition,
      order: { guardDate: 'ASC' },
    });
  }

  // ==================== MAPPING ====================

  private mapToResponse(practitioner: Practitioner): PractitionerResponseDto {
    return {
      id: practitioner.id,
      user_id: practitioner.userId,
      specialty: practitioner.specialty,
      title: practitioner.title || null,
      first_name: practitioner.firstName || null,
      last_name: practitioner.lastName || null,
      email: practitioner.email || null,
      phone: practitioner.phone || null,
      bio: practitioner.bio || null,
      education: practitioner.education || null,
      license_number: practitioner.licenseNumber || null,
      consultation_fee: practitioner.consultationFee || null,
      years_of_experience: practitioner.yearsOfExperience || null,
      languages: practitioner.languages || ['Français'],
      calendar_color: practitioner.calendarColor || '#3B82F6',
      profile_image_url: practitioner.profileImageUrl || null,
      accepts_new_patients: practitioner.acceptsNewPatients,
      max_patients_per_day: practitioner.maxPatientsPerDay || null,
      appointment_buffer_minutes: practitioner.appointmentBufferMinutes || 0,
      is_active: practitioner.isActive,
      date_of_birth: practitioner.dateOfBirth || null,
      gender: practitioner.gender || null,
      nationality: practitioner.nationality || null,
      address: practitioner.address || null,
      city: practitioner.city || null,
      postal_code: practitioner.postalCode || null,
      created_at: practitioner.createdAt,
      updated_at: practitioner.updatedAt,
    };
  }
}
