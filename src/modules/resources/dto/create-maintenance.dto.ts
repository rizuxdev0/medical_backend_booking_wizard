import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceLogDto {
  @ApiProperty({ example: 'Maintenance préventive' })
  @IsString()
  maintenance_type: string;

  @ApiProperty({ example: 'Vérification annuelle', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-25', required: false })
  @IsOptional()
  @IsDateString()
  maintenance_date?: string;

  @ApiProperty({ example: '2025-12-25', required: false })
  @IsOptional()
  @IsDateString()
  next_scheduled_date?: string;

  @ApiProperty({ example: 'Jean Dupont', required: false })
  @IsOptional()
  @IsString()
  performed_by?: string;

  @ApiProperty({ example: 15000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty({
    example: 'completed',
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'Notes de maintenance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
