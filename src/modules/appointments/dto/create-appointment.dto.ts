import {
  IsUUID,
  IsDateString,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'uuid-du-patient' })
  @IsUUID()
  patient_id: string;

  @ApiProperty({ example: 'uuid-du-praticien' })
  @IsUUID()
  practitioner_id: string;

  @ApiProperty({ example: 'uuid-du-type', required: false })
  @IsOptional()
  @IsUUID()
  appointment_type_id?: string;

  @ApiProperty({ example: 'uuid-de-la-ressource', required: false })
  @IsOptional()
  @IsUUID()
  resource_id?: string;

  @ApiProperty({ example: '2024-12-25T14:30:00Z' })
  @IsDateString()
  scheduled_at: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(5)
  duration_minutes?: number;

  @ApiProperty({ example: 'Notes pour le rendez-vous', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
