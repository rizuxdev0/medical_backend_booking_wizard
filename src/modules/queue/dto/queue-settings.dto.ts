import { IsNumber, IsBoolean, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueueSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  resource_id?: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(1)
  average_service_time_minutes: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_queue_size?: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  auto_call_enabled: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  display_position_to_patient: boolean;
}
