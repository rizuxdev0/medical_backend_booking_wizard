import {
  IsUUID,
  IsDateString,
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateInvoiceItemDto {
  @ApiProperty({ example: 'uuid-item', required: false })
  @IsOptional()
  @IsUUID()
  billable_item_id?: string;

  @ApiProperty({ example: 'Consultation générale' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'CONS001', required: false })
  @IsOptional()
  @IsString()
  service_code?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  unit_price: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-patient' })
  @IsUUID()
  patient_id: string;

  @ApiProperty({ example: 'uuid-praticien', required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ example: 'uuid-rendez-vous', required: false })
  @IsOptional()
  @IsUUID()
  appointment_id?: string;

  @ApiProperty({ example: '2024-12-25', required: false })
  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @ApiProperty({ example: '2025-01-25', required: false })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({ example: 18.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax_rate?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiProperty({ example: 'XOF', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  is_deferred?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  installment_count?: number;

  @ApiProperty({ example: 'Facture pour consultation', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'uuid-insurer', required: false })
  @IsOptional()
  @IsUUID()
  insurer_id?: string;

  @ApiProperty({ example: 80, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coverage_rate?: number;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
