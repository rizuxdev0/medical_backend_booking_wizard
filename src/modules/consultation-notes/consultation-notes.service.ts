import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultationNote } from '../appointments/entities/consultation-note.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { Patient } from '../patients/entities/patient.entity';
import {
  CreateConsultationNoteDto,
  UpdateConsultationNoteDto,
  ConsultationNoteResponseDto,
} from './dto/create-consultation-note.dto';

@Injectable()
export class ConsultationNotesService {
  constructor(
    @InjectRepository(ConsultationNote)
    private noteRepo: Repository<ConsultationNote>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async findByAppointment(
    appointmentId: string,
  ): Promise<ConsultationNoteResponseDto> {
    const note = await this.noteRepo.findOne({
      where: { appointmentId },
      relations: ['practitioner', 'appointment'],
    });

    if (!note) {
      throw new NotFoundException(
        `Note de consultation pour le rendez-vous ${appointmentId} non trouvée`,
      );
    }

    return this.mapToResponse(note);
  }

  async findAll(): Promise<ConsultationNote[]> {
    return this.noteRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['appointment', 'patient', 'practitioner'],
    });
  }

  async findOne(id: string): Promise<ConsultationNoteResponseDto> {
    const note = await this.noteRepo.findOne({
      where: { id },
      relations: ['practitioner', 'appointment', 'parentConsultation'],
    });

    if (!note) {
      throw new NotFoundException(
        `Note de consultation avec l'ID ${id} non trouvée`,
      );
    }

    return this.mapToResponse(note);
  }

  async create(
    createNoteDto: CreateConsultationNoteDto,
    userId: string,
  ): Promise<ConsultationNoteResponseDto> {
    // Vérifier que le rendez-vous existe
    const appointment = await this.appointmentRepo.findOne({
      where: { id: createNoteDto.appointment_id },
      relations: ['practitioner', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    // Vérifier qu'il n'y a pas déjà une note pour ce rendez-vous
    const existing = await this.noteRepo.findOne({
      where: { appointmentId: createNoteDto.appointment_id },
    });

    if (existing) {
      throw new BadRequestException(
        'Une note de consultation existe déjà pour ce rendez-vous',
      );
    }

    // Compter les consultations précédentes du patient
    const previousCount = await this.noteRepo.count({
      where: { patientId: appointment.patientId },
    });

    const noteData: Partial<ConsultationNote> = {
      appointmentId: createNoteDto.appointment_id,
      practitionerId: appointment.practitionerId,
      patientId: appointment.patientId,
      consultationNumber: previousCount + 1,
    };

    const fieldMappings = {
      chief_complaint: 'chiefComplaint',
      history_present_illness: 'historyPresentIllness',
      examination_findings: 'examinationFindings',
      diagnosis: 'diagnosis',
      treatment_plan: 'treatmentPlan',
      prescriptions: 'prescriptions',
      vital_signs: 'vitalSigns',
      follow_up_notes: 'followUpNotes',
      follow_up_date: 'followUpDate',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (createNoteDto[snakeField] !== undefined) {
        noteData[camelField] = createNoteDto[snakeField];
      }
    });

    const note = this.noteRepo.create(noteData);
    await this.noteRepo.save(note);

    // Mettre à jour le statut du rendez-vous
    await this.appointmentRepo.update(appointment.id, { status: 'completed' });

    const savedNote = await this.noteRepo.findOne({
      where: { id: note.id },
      relations: ['practitioner', 'appointment'],
    });

    if (!savedNote) {
      throw new NotFoundException(
        'Note de consultation non trouvée après création',
      );
    }

    return this.mapToResponse(savedNote);
  }

  async update(
    id: string,
    updateNoteDto: UpdateConsultationNoteDto,
  ): Promise<ConsultationNoteResponseDto> {
    const note = await this.noteRepo.findOne({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException(
        `Note de consultation avec l'ID ${id} non trouvée`,
      );
    }

    if (note.isClosed) {
      throw new BadRequestException('Impossible de modifier une note fermée');
    }

    const updateData: Partial<ConsultationNote> = {};

    const fieldMappings = {
      chief_complaint: 'chiefComplaint',
      history_present_illness: 'historyPresentIllness',
      examination_findings: 'examinationFindings',
      diagnosis: 'diagnosis',
      treatment_plan: 'treatmentPlan',
      prescriptions: 'prescriptions',
      vital_signs: 'vitalSigns',
      follow_up_notes: 'followUpNotes',
      follow_up_date: 'followUpDate',
    };

    Object.keys(fieldMappings).forEach((snakeField) => {
      const camelField = fieldMappings[snakeField];
      if (updateNoteDto[snakeField] !== undefined) {
        updateData[camelField] = updateNoteDto[snakeField];
      }
    });

    if (Object.keys(updateData).length > 0) {
      await this.noteRepo.update(id, updateData);
    }

    const updatedNote = await this.noteRepo.findOne({
      where: { id },
      relations: ['practitioner', 'appointment'],
    });

    if (!updatedNote) {
      throw new NotFoundException(
        `Note de consultation avec l'ID ${id} non trouvée après mise à jour`,
      );
    }

    return this.mapToResponse(updatedNote);
  }

  async close(
    id: string,
    closedBy: string,
  ): Promise<ConsultationNoteResponseDto> {
    const note = await this.noteRepo.findOne({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException(
        `Note de consultation avec l'ID ${id} non trouvée`,
      );
    }

    if (note.isClosed) {
      throw new BadRequestException('Cette note est déjà fermée');
    }

    await this.noteRepo.update(id, {
      isClosed: true,
      closedAt: new Date(),
      closedBy,
    });

    const closedNote = await this.noteRepo.findOne({
      where: { id },
      relations: ['practitioner', 'appointment'],
    });

    if (!closedNote) {
      throw new NotFoundException(
        `Note de consultation avec l'ID ${id} non trouvée après fermeture`,
      );
    }

    return this.mapToResponse(closedNote);
  }

  private mapToResponse(note: ConsultationNote): ConsultationNoteResponseDto {
    return {
      id: note.id,
      appointment_id: note.appointmentId,
      practitioner_id: note.practitionerId,
      patient_id: note.patientId,
      parent_consultation_id: note.parentConsultationId || null,
      consultation_number: note.consultationNumber,
      consultation_type: note.consultationType,
      chief_complaint: note.chiefComplaint || null,
      history_present_illness: note.historyPresentIllness || null,
      examination_findings: note.examinationFindings || null,
      diagnosis: note.diagnosis || null,
      treatment_plan: note.treatmentPlan || null,
      prescriptions: note.prescriptions || null,
      vital_signs: note.vitalSigns,
      follow_up_notes: note.followUpNotes || null,
      follow_up_date: note.followUpDate || null,
      is_closed: note.isClosed,
      closed_at: note.closedAt || null,
      closed_by: note.closedBy || null,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    };
  }
}
