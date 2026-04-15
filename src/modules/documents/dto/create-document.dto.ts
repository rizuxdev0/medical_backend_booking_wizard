import { IsNotEmpty, IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  practitioner_id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  file_url: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  file_type?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  file_size?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  type?: string;
}
