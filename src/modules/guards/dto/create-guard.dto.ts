import {
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGuardDto {
  @ApiProperty({ example: 'uuid-praticien' })
  @IsUUID()
  practitioner_id: string;

  @ApiProperty({ example: '2024-12-25' })
  @IsDateString()
  guard_date: string;

  @ApiProperty({ example: '18:00', required: false })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiProperty({ example: '08:00', required: false })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiProperty({
    example: 'night',
    enum: ['night', 'weekend', 'holiday'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['night', 'weekend', 'holiday'])
  guard_type?: string;

  @ApiProperty({ example: 'Garde de nuit', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateGuardDto extends CreateGuardDto {}

export class GuardQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  month?: string; // Format: YYYY-MM

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  start?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  end?: string;
}




export class GuardResponseDto {
  id: string;
  practitioner_id: string;
  guard_date: string;
  start_time: string;
  end_time: string;
  guard_type: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;

  practitioner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    specialty: string;
  };
}
