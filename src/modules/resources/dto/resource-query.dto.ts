import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResourceQueryDto {
  @ApiProperty({ enum: ['room', 'equipment'], required: false })
  @IsOptional()
  @IsEnum(['room', 'equipment'])
  type?: 'room' | 'equipment';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
