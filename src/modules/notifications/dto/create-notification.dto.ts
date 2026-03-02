import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  IsBooleanString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'uuid-rendez-vous' })
  @IsUUID()
  appointment_id: string;

  @ApiProperty({ enum: ['reminder', 'confirmation', 'cancellation', 'update'] })
  @IsEnum(['reminder', 'confirmation', 'cancellation', 'update'])
  type: string;

  @ApiProperty({ example: '2024-12-25T08:00:00Z' })
  @IsDateString()
  scheduled_for: string;
}

export class CreateNotificationLogDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @ApiProperty({ example: 'appointment_reminder' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Rappel de rendez-vous' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Vous avez un rendez-vous demain à 14h30' })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  data?: any;
}

export class NotificationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['pending', 'sent', 'failed'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  is_read?: string;
}
