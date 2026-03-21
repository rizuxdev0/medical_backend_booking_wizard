import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GuardQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  month?: string; // Format: YYYY-MM

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  practitioner_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  start?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  end?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  from_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  to_date?: string;
}

