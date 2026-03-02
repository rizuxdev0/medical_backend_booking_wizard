import {
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceBookingDto {
  @ApiProperty({ example: 'uuid-praticien', required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ example: 'uuid-rendez-vous', required: false })
  @IsOptional()
  @IsUUID()
  appointment_id?: string;

  @ApiProperty({ example: '2024-12-25T14:00:00Z' })
  @IsDateString()
  start_time: string;

  @ApiProperty({ example: '2024-12-25T16:00:00Z' })
  @IsDateString()
  end_time: string;

  @ApiProperty({ example: 'Utilisation pour échographie', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
