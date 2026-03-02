import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ example: 'Salle de consultation 101' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['room', 'equipment'], example: 'room' })
  @IsEnum(['room', 'equipment'])
  type: 'room' | 'equipment';

  @ApiProperty({ example: 'Salle au premier étage', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Bâtiment A', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '1er étage', required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  maintenance_required?: boolean;

  @ApiProperty({ example: 'uuid-praticien', required: false })
  @IsOptional()
  @IsUUID()
  assigned_practitioner_id?: string;

  @ApiProperty({ example: 'Siemens', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ example: 'Ultrasound X2000', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'SN123456', required: false })
  @IsOptional()
  @IsString()
  serial_number?: string;

  @ApiProperty({ example: '2023-01-15', required: false })
  @IsOptional()
  @IsString()
  purchase_date?: string;

  @ApiProperty({ example: '2025-01-15', required: false })
  @IsOptional()
  @IsString()
  warranty_expiry_date?: string;

  @ApiProperty({ example: '2024-12-01', required: false })
  @IsOptional()
  @IsString()
  last_maintenance_date?: string;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsOptional()
  @IsString()
  next_maintenance_date?: string;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_per_hour?: number;

  @ApiProperty({ example: 'Jean Dupont', required: false })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiProperty({ example: '+225 07 00 00 01', required: false })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ example: 'Notes supplémentaires', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
