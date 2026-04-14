import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClinicalActDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ example: 'Consultation Générale' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isBilled?: boolean;
}
