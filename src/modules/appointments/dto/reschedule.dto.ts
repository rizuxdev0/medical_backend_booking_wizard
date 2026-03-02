import { IsDateString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleDto {
  @ApiProperty({ example: '2024-12-26T15:00:00Z' })
  @IsDateString()
  scheduled_at: string;

  @ApiProperty({ example: 'uuid-du-praticien', required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;
}
