// src/samples/dto/update-sample.dto.ts
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { SampleStatus } from '@prisma/client';

export class UpdateSampleDto {
  @IsOptional()
  @IsEnum(SampleStatus)
  status?: SampleStatus; // 'SEALED' | 'SHIPPED' | 'RECEIVED' | 'ANALYZING' | 'ARCHIVED'

  @IsOptional()
  // Use string no formato ISO 8601 (ex.: "2025-11-16T20:15:00Z")
  @IsISO8601()
  collectedAt?: string;

  @IsOptional()
  @IsString()
  collectedByUserId?: string;

  @IsOptional()
  // Mantemos flexível: objeto JSON arbitrário (cadeia de custódia)
  // Se quiser forçar objeto: troque por @IsObject()
  chainOfCustody?: Record<string, any>;
}
