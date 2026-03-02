import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ example: 'uuid-patient' })
  @IsUUID()
  patient_id: string;

  @ApiProperty({ example: 'uuid-praticien', required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ example: 'uuid-rendez-vous', required: false })
  @IsOptional()
  @IsUUID()
  appointment_id?: string;

  @ApiProperty({ example: 'uuid-ressource', required: false })
  @IsOptional()
  @IsUUID()
  resource_id?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @ApiProperty({ example: 'Patient prioritaire', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
