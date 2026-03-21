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
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number;
}

