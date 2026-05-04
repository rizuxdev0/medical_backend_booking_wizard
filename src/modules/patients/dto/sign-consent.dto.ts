import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SignConsentDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  consentType: string;

  @IsString()
  @IsNotEmpty()
  consentText: string;

  @IsString()
  @IsNotEmpty()
  signatureImage: string; // Base64 signature

  @IsString()
  @IsOptional()
  witnessName?: string;
}
