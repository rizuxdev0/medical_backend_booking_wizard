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
}
