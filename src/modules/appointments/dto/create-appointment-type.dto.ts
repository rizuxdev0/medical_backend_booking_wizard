import { IsString, IsNotEmpty, IsNumber, IsOptional, IsHexColor, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentTypeDto {
  @ApiProperty({ example: 'Consultation Générale' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Consultation de routine et suivi' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(5)
  duration_minutes: number;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsHexColor()
  @IsOptional()
  color?: string;
}
