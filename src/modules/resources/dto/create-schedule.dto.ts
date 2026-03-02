import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceScheduleDto {
  @ApiProperty({ example: 1, minimum: 0, maximum: 6 })
  @IsNumber()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiProperty({ example: '08:00' })
  @IsString()
  start_time: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  end_time: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
