import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
