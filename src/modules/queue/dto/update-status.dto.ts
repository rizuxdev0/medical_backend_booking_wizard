import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueueStatus } from '../entities/queue-entry.entity';

export class UpdateQueueStatusDto {
  @ApiProperty({
    enum: QueueStatus,
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: QueueStatus;
}
