import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityQueryDto {
  @ApiProperty({ example: '2024-12-25' })
  @IsDateString()
  date: string;
}
