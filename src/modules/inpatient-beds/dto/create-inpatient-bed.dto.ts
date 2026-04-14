import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInpatientBedDto {
  @ApiProperty({ example: '101A' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({ example: 'Standard' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ enum: ['available', 'occupied', 'cleaning', 'maintenance'], default: 'available' })
  @IsEnum(['available', 'occupied', 'cleaning', 'maintenance'])
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  patientName?: string;
}
