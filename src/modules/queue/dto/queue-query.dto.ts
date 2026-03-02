import { IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueueQueryDto {
  @ApiProperty({
    required: false,
    enum: [
      'waiting',
      'called',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
    ],
  })
  @IsOptional()
  @IsEnum([
    'waiting',
    'called',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  resource_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
