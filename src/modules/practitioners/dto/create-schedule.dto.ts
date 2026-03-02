import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ example: 1, minimum: 0, maximum: 6 })
  @IsNumber()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  start_time: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  end_time: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
