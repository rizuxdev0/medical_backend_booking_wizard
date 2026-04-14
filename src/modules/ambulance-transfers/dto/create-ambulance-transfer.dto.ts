import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAmbulanceTransferDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({ enum: ['inbound', 'outbound'] })
  @IsEnum(['inbound', 'outbound'])
  type: string;

  @ApiProperty({ example: 'Hôpital Général' })
  @IsString()
  @IsNotEmpty()
  originDestination: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsOptional()
  priority?: string;

  @ApiProperty({ enum: ['scheduled', 'in_transit', 'completed', 'cancelled'], default: 'scheduled' })
  @IsEnum(['scheduled', 'in_transit', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'Besoin d\'assistance respiratoire' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transferTime: string;
}
