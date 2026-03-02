import { IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LogQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
