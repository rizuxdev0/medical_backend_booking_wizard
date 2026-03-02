import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsultationNoteDto {
  @ApiProperty({ example: 'uuid-rendez-vous' })
  @IsUUID()
  appointment_id: string;

  @ApiProperty({ example: 'Douleur thoracique', required: false })
  @IsOptional()
  @IsString()
  chief_complaint?: string;

  @ApiProperty({ example: 'Début il y a 2 jours', required: false })
  @IsOptional()
  @IsString()
  history_present_illness?: string;

  @ApiProperty({ example: 'PA: 120/80, FC: 72', required: false })
  @IsOptional()
  @IsString()
  examination_findings?: string;

  @ApiProperty({ example: 'Hypertension artérielle', required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ example: 'Traitement par antihypertenseurs', required: false })
  @IsOptional()
  @IsString()
  treatment_plan?: string;

  @ApiProperty({ example: 'Amlodipine 5mg/jour', required: false })
  @IsOptional()
  @IsString()
  prescriptions?: string;

  @ApiProperty({ example: { temperature: 37.2, weight: 75 }, required: false })
  @IsOptional()
  @IsObject()
  vital_signs?: any;

  @ApiProperty({ example: 'Revoir dans 1 mois', required: false })
  @IsOptional()
  @IsString()
  follow_up_notes?: string;

  @ApiProperty({ example: '2025-01-25', required: false })
  @IsOptional()
  @IsDateString()
  follow_up_date?: string;
}

export class UpdateConsultationNoteDto extends CreateConsultationNoteDto {}

export class ConsultationNoteResponseDto {
  id: string;
  appointment_id: string;
  practitioner_id: string;
  patient_id: string;
  parent_consultation_id: string | null;
  consultation_number: number;
  consultation_type: string;
  chief_complaint: string | null;
  history_present_illness: string | null;
  examination_findings: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  prescriptions: string | null;
  vital_signs: any;
  follow_up_notes: string | null;
  follow_up_date: string | null;
  is_closed: boolean;
  closed_at: Date | null;
  closed_by: string | null;
  created_at: Date;
  updated_at: Date;

  practitioner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    specialty: string;
  };

  appointment?: {
    id: string;
    scheduled_at: Date;
  };
}
