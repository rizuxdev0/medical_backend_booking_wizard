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
import { MailService } from '../settings/mail.service';
import { Between } from 'typeorm';

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
    private readonly mailService: MailService,
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

  async findByPatientToday(
    patientId: string,
  ): Promise<ConsultationNoteResponseDto | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const note = await this.noteRepo.findOne({
      where: {
        patientId,
        createdAt: Between(today, tomorrow),
      },
      relations: ['practitioner', 'appointment'],
      order: { createdAt: 'DESC' },
    });

    return note ? this.mapToResponse(note) : null;
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

  async sign(id: string): Promise<ConsultationNoteResponseDto> {
    const note = await this.noteRepo.findOne({
      where: { id },
      relations: ['practitioner', 'patient'],
    });

    if (!note) {
      throw new NotFoundException(`Note de consultation avec l'ID ${id} non trouvée`);
    }

    if (note.isSigned) {
      throw new BadRequestException('Cette note est déjà signée');
    }

    // Create a digital signature hash
    const crypto = require('crypto');
    const contentToSign = `${note.id}|${note.diagnosis}|${note.treatmentPlan}|${note.createdAt.toISOString()}`;
    const signatureHash = crypto.createHash('sha256').update(contentToSign).digest('hex');

    await this.noteRepo.update(id, {
      isSigned: true,
      signedAt: new Date(),
      signatureHash,
    });

    return this.findOne(id);
  }

  async sendSummaryEmail(id: string, customMessage?: string): Promise<void> {
    const note = await this.noteRepo.findOne({
      where: { id },
      relations: ['patient', 'practitioner'],
    });

    if (!note) {
      throw new NotFoundException('Note de consultation non trouvée');
    }

    if (!note.patient.email) {
      throw new BadRequestException("Le patient n'a pas d'adresse email renseignée");
    }

    const patientName = `${note.patient.firstName} ${note.patient.lastName}`;
    const practitionerName = note.practitioner 
      ? `Dr. ${note.practitioner.firstName || ''} ${note.practitioner.lastName || ''}`
      : 'Votre praticien';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #3b82f6;">Résumé de votre consultation</h2>
        <p>Bonjour ${note.patient.firstName},</p>
        ${customMessage ? `<p style="font-style: italic; background: #f3f4f6; padding: 10px; border-radius: 5px;">${customMessage}</p>` : ''}
        <p>Voici le résumé de votre visite du ${note.createdAt.toLocaleDateString('fr-FR')} avec ${practitionerName}.</p>
        
        <div style="margin-top: 20px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
          ${note.diagnosis ? `<p><strong>Diagnostic :</strong><br>${note.diagnosis}</p>` : ''}
          ${note.treatmentPlan ? `<p><strong>Plan de traitement :</strong><br>${note.treatmentPlan.replace(/\n/g, '<br>')}</p>` : ''}
          ${note.prescriptions ? `<p><strong>Prescriptions :</strong><br>${note.prescriptions.replace(/\n/g, '<br>')}</p>` : ''}
          ${note.followUpDate ? `<p><strong>Prochain RDV :</strong><br>${new Date(note.followUpDate).toLocaleDateString('fr-FR')}</p>` : ''}
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
          Ceci est un message automatique de votre clinique. Pour toute question, veuillez nous contacter directement.
        </p>
      </div>
    `;

    await this.mailService.sendMail({
      to: note.patient.email,
      subject: `Résumé de votre consultation - ${note.createdAt.toLocaleDateString('fr-FR')}`,
      html,
    });
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
      is_signed: note.isSigned,
      signed_at: note.signedAt || null,
      signature_hash: note.signatureHash || null,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    };
  }
}
