import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQueueStatusDto {
  @ApiProperty({
    enum: [
      'waiting',
      'called',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
    ],
  })
  @IsEnum([
    'waiting',
    'called',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ])
  status: string;
}
