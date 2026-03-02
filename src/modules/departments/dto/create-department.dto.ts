import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Cardiologie' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CARD', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'Département de cardiologie', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-user', required: false })
  @IsOptional()
  @IsUUID()
  head_user_id?: string;

  @ApiProperty({ example: 'uuid-department', required: false })
  @IsOptional()
  @IsUUID()
  parent_department_id?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateDepartmentDto extends CreateDepartmentDto {}

export class DepartmentResponseDto {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  head_user_id: string | null;
  parent_department_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  head?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };

  children?: DepartmentResponseDto[];
}
