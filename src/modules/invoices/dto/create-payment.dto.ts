import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    example: 'cash',
    enum: ['cash', 'card', 'check', 'mobile_money', 'bank_transfer'],
  })
  @IsString()
  payment_method: string;

  @ApiProperty({ example: '2024-12-25', required: false })
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @ApiProperty({ example: 'REF123456', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 'XOF', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Paiement en espèces', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
