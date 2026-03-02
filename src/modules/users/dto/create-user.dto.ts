import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jean', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'Dupont', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ example: '+225 07 00 00 00', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Cardiologie', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Médecin', required: false })
  @IsOptional()
  @IsString()
  job_title?: string;

  @ApiProperty({ example: 'EMP001', required: false })
  @IsOptional()
  @IsString()
  employee_id?: string;

  @ApiProperty({
    example: ['admin', 'doctor'],
    required: false,
    enum: [
      'admin',
      'doctor',
      'secretary',
      'patient',
      'nurse',
      'accountant',
      'supervisor',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(
    [
      'admin',
      'doctor',
      'secretary',
      'patient',
      'nurse',
      'accountant',
      'supervisor',
    ],
    { each: true },
  )
  roles?: string[];
}
