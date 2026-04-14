import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNursingCarePlanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bedId: string;

  @ApiProperty({ example: 'Administration médicament' })
  @IsString()
  @IsNotEmpty()
  careType: string;

  @ApiProperty({ example: 'Paracétamol 500mg' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ example: '08:00, 14:00, 20:00' })
  @IsString()
  @IsOptional()
  frequency?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isDone?: boolean;
}
