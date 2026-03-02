import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
  })
  @IsEnum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
  status: string;
}
