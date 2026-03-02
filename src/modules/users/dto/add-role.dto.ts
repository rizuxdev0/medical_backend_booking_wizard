import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddRoleDto {
  @ApiProperty({
    enum: [
      'admin',
      'doctor',
      'secretary',
      'patient',
      'nurse',
      'accountant',
      'supervisor',
    ],
    example: 'doctor',
  })
  @IsEnum([
    'admin',
    'doctor',
    'secretary',
    'patient',
    'nurse',
    'accountant',
    'supervisor',
  ])
  role: string;
}
