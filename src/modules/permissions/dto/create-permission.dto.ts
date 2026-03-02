import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'patients.view' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Voir les patients' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Permission de consulter la liste des patients',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'patients' })
  @IsString()
  module: string;
}

export class AssignPermissionsDto {
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
  })
  role: string;

  @ApiProperty({
    type: [String],
    example: ['patients.view', 'patients.create'],
  })
  permission_codes: string[];
}

export class PermissionResponseDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  created_at: Date;
}

export class RolePermissionsResponseDto {
  role: string;
  permissions: PermissionResponseDto[];
}
