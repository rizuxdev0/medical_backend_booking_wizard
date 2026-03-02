import { IsDateString, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAbsenceDto {
  @ApiProperty({ example: '2024-12-25' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ example: 'Congés annuels', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
