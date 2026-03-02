import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SettingDto {
  @ApiProperty({ example: 'company_name' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: { name: 'Ma Clinique', address: 'Abidjan' } })
  @IsNotEmpty()
  value: any;
}

export class SettingResponseDto {
  id: string;
  key: string;
  value: any;
  created_at: Date;
  updated_at: Date;
}
