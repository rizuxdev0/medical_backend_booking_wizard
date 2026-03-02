import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Mamadou' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Touré' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'patient@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+225 07 00 00 04', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '1990-05-15', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({
    example: 'Masculin',
    required: false,
    enum: ['Masculin', 'Féminin', 'Autre'],
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'O+', required: false })
  @IsOptional()
  @IsString()
  blood_type?: string;

  @ApiProperty({ example: '15 Rue des Lilas', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Abidjan', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: '75001', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ example: 'Ivoirienne', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ example: 'Ingénieur', required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ example: 'Marié', required: false })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiProperty({ example: 'Français', required: false })
  @IsOptional()
  @IsString()
  preferred_language?: string;

  @ApiProperty({ example: '1-23456-789', required: false })
  @IsOptional()
  @IsString()
  social_security_number?: string;

  @ApiProperty({ example: 'AXA Assurance', required: false })
  @IsOptional()
  @IsString()
  insurance_provider?: string;

  @ApiProperty({ example: 'POL-123456', required: false })
  @IsOptional()
  @IsString()
  insurance_number?: string;

  @ApiProperty({ example: 'Fatou Touré', required: false })
  @IsOptional()
  @IsString()
  emergency_contact_name?: string;

  @ApiProperty({ example: '+225 07 00 00 05', required: false })
  @IsOptional()
  @IsString()
  emergency_contact_phone?: string;

  @ApiProperty({ example: 'Aucune', required: false })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({ example: 'Patient suivi pour hypertension', required: false })
  @IsOptional()
  @IsString()
  medical_notes?: string;

  @ApiProperty({ example: 'Notes diverses', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
