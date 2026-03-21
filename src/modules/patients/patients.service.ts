import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { PatientQueryDto } from './dto/patient-query.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async findAll(
    query: PatientQueryDto,
  ): Promise<PatientResponseDto[]> {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let whereCondition = {};

    if (search) {
      whereCondition = [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
      ];
    }

    const [patients] = await this.patientRepo.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { lastName: 'ASC' }, // Sort by lastName as per guide
    });

    return patients.map((patient) => this.mapToResponse(patient));
  }

  async findAllForSelect(): Promise<Partial<PatientResponseDto>[]> {
    const patients = await this.patientRepo.find({
      select: ['id', 'firstName', 'lastName'],
      order: { lastName: 'ASC' },
    });

    return patients.map((patient) => ({
      id: patient.id,
      first_name: patient.firstName,
      last_name: patient.lastName,
    }));
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepo.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }

    return this.mapToResponse(patient);
  }

  async create(
    createPatientDto: CreatePatientDto,
    userId: string,
  ): Promise<PatientResponseDto> {
    // Vérifier si un patient avec le même email existe déjà (si email fourni)
    if (createPatientDto.email) {
      const existingPatient = await this.patientRepo.findOne({
        where: { email: createPatientDto.email },
      });

      if (existingPatient) {
        throw new BadRequestException('Un patient avec cet email existe déjà');
      }
    }

    // Vérifier si un patient avec le même téléphone existe déjà (si téléphone fourni)
    if (createPatientDto.phone) {
      const existingPatient = await this.patientRepo.findOne({
        where: { phone: createPatientDto.phone },
      });

      if (existingPatient) {
        throw new BadRequestException(
          'Un patient avec ce téléphone existe déjà',
        );
      }
    }

    // Créer le patient - UTILISER LES NOMS DE PROPRIÉTÉS DE L'ENTITÉ (camelCase)
    const patientData: Partial<Patient> = {
      firstName: createPatientDto.first_name,
      lastName: createPatientDto.last_name,
      userId: userId, // L'ID de l'utilisateur qui crée le patient
    };

    // Ajouter les champs optionnels s'ils existent (mapper snake_case -> camelCase)
    const fieldMappings = {
      email: 'email',
      phone: 'phone',
      date_of_birth: 'dateOfBirth',
      gender: 'gender',
      blood_type: 'bloodType',
      address: 'address',
      city: 'city',
      postal_code: 'postalCode',
      nationality: 'nationality',
      occupation: 'occupation',
      marital_status: 'maritalStatus',
      preferred_language: 'preferredLanguage',
      social_security_number: 'socialSecurityNumber',
      insurance_provider: 'insuranceProvider',
      insurance_number: 'insuranceNumber',
      emergency_contact_name: 'emergencyContactName',
      emergency_contact_phone: 'emergencyContactPhone',
      allergies: 'allergies',
      medical_notes: 'medicalNotes',
      notes: 'notes',
      user_id: 'userId',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (createPatientDto[snakeField] !== undefined) {
        patientData[camelField] = createPatientDto[snakeField];
      }
    });

    const patient = this.patientRepo.create(patientData);
    await this.patientRepo.save(patient);

    return this.mapToResponse(patient);
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    const patient = await this.patientRepo.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }

    // Vérifier l'unicité de l'email si modifié
    if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
      const existingPatient = await this.patientRepo.findOne({
        where: { email: updatePatientDto.email },
      });

      if (existingPatient) {
        throw new BadRequestException('Un patient avec cet email existe déjà');
      }
    }

    // Vérifier l'unicité du téléphone si modifié
    if (updatePatientDto.phone && updatePatientDto.phone !== patient.phone) {
      const existingPatient = await this.patientRepo.findOne({
        where: { phone: updatePatientDto.phone },
      });

      if (existingPatient) {
        throw new BadRequestException(
          'Un patient avec ce téléphone existe déjà',
        );
      }
    }

    // Préparer les données de mise à jour (mapper snake_case -> camelCase)
    const updateData: Partial<Patient> = {};

    const fieldMappings = {
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'email',
      phone: 'phone',
      date_of_birth: 'dateOfBirth',
      gender: 'gender',
      blood_type: 'bloodType',
      address: 'address',
      city: 'city',
      postal_code: 'postalCode',
      nationality: 'nationality',
      occupation: 'occupation',
      marital_status: 'maritalStatus',
      preferred_language: 'preferredLanguage',
      social_security_number: 'socialSecurityNumber',
      insurance_provider: 'insuranceProvider',
      insurance_number: 'insuranceNumber',
      emergency_contact_name: 'emergencyContactName',
      emergency_contact_phone: 'emergencyContactPhone',
      allergies: 'allergies',
      medical_notes: 'medicalNotes',
      notes: 'notes',
      user_id: 'userId',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (updatePatientDto[snakeField] !== undefined) {
        updateData[camelField] = updatePatientDto[snakeField];
      }
    });

    if (Object.keys(updateData).length > 0) {
      await this.patientRepo.update(id, updateData);
    }

    // Récupérer le patient mis à jour
    const updatedPatient = await this.patientRepo.findOne({
      where: { id },
    });

    if (!updatedPatient) {
      throw new NotFoundException(
        `Patient avec l'ID ${id} non trouvé après mise à jour`,
      );
    }

    return this.mapToResponse(updatedPatient);
  }

  async findByUserId(userId: string): Promise<PatientResponseDto | null> {
    const patient = await this.patientRepo.findOne({
      where: { userId },
    });

    if (!patient) return null;
    return this.mapToResponse(patient);
  }

  async remove(id: string): Promise<{ message: string }> {
    const patient = await this.patientRepo.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }

    await this.patientRepo.remove(patient);

    return {
      message: `Patient ${patient.firstName} ${patient.lastName} supprimé avec succès`, // Changé first_name -> firstName
    };
  }

  async getAppointments(id: string): Promise<any[]> {
    const patient = await this.patientRepo.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }

    // Cette méthode sera implémentée quand le module appointments sera créé
    // Pour l'instant, retourner un tableau vide
    return [];
  }

  async getInvoices(id: string): Promise<any[]> {
    const patient = await this.patientRepo.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }

    // Cette méthode sera implémentée quand le module invoices sera créé
    // Pour l'instant, retourner un tableau vide
    return [];
  }

  private mapToResponse(patient: Patient): PatientResponseDto {
    return {
      id: patient.id,
      user_id: patient.userId,
      first_name: patient.firstName,
      last_name: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.dateOfBirth,
      gender: patient.gender,
      blood_type: patient.bloodType,
      address: patient.address,
      city: patient.city,
      postal_code: patient.postalCode,
      nationality: patient.nationality,
      occupation: patient.occupation,
      marital_status: patient.maritalStatus,
      preferred_language: patient.preferredLanguage || 'Français',
      social_security_number: patient.socialSecurityNumber,
      insurance_provider: patient.insuranceProvider,
      insurance_number: patient.insuranceNumber,
      emergency_contact_name: patient.emergencyContactName,
      emergency_contact_phone: patient.emergencyContactPhone,
      allergies: patient.allergies,
      medical_notes: patient.medicalNotes,
      notes: patient.notes,
      created_at: patient.createdAt,
      updated_at: patient.updatedAt,
    };
  }
}
