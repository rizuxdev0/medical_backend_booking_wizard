import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'XOF' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Franc CFA (BCEAO)' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'FCFA' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  decimal_places?: number;

  @ApiProperty({ example: ',', required: false })
  @IsOptional()
  @IsString()
  decimal_separator?: string;

  @ApiProperty({ example: ' ', required: false })
  @IsOptional()
  @IsString()
  thousands_separator?: string;

  @ApiProperty({ example: 'after', enum: ['before', 'after'], required: false })
  @IsOptional()
  @IsString()
  symbol_position?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;
}

export class UpdateCurrencyDto extends CreateCurrencyDto {}

export class CurrencyResponseDto {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  decimal_separator: string;
  thousands_separator: string;
  symbol_position: string;
  is_active: boolean;
  is_default: boolean;
  exchange_rate: number;
  created_at: Date;
  updated_at: Date;
}
