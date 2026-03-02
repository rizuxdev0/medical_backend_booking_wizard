import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePractitionerDto {
  @ApiProperty({ example: 'Cardiologie' })
  @IsString()
  specialty: string;

  @ApiProperty({ example: 'Dr', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Jean', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'Dupont', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ example: 'jean.dupont@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+225 07 00 00 01', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Spécialiste en cardiologie interventionnelle',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'Université de Médecine de Paris', required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ example: 'LIC-12345', required: false })
  @IsOptional()
  @IsString()
  license_number?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consultation_fee?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  years_of_experience?: number;

  @ApiProperty({ example: ['Français', 'Anglais'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ example: '#3B82F6', required: false })
  @IsOptional()
  @IsString()
  calendar_color?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  accepts_new_patients?: boolean;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_patients_per_day?: number;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  appointment_buffer_minutes?: number;

  @ApiProperty({ example: '1980-01-01', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ example: 'Masculin', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'Française', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ example: '15 Rue des Médecins', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Paris', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: '75001', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;
}
