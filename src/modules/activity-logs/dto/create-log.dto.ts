import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateLogDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsString()
  action: string;

  @IsString()
  entity_type: string;

  @IsOptional()
  @IsString()
  entity_id?: string;

  @IsOptional()
  @IsString()
  entity_name?: string;

  @IsOptional()
  @IsObject()
  old_data?: any;

  @IsOptional()
  @IsObject()
  new_data?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsString()
  ip_address?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;
}
