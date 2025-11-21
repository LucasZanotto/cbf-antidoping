// src/samples/dto/create-sample.dto.ts
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SampleStatus, SampleType } from '@prisma/client';

export class CreateSampleDto {
  @IsString()
  @IsNotEmpty()
  testOrderId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsEnum(SampleType)
  type!: SampleType; // 'URINE' | 'BLOOD'

  @IsOptional()
  @IsEnum(SampleStatus)
  status?: SampleStatus; // 'SEALED' | 'SHIPPED' | 'RECEIVED' | 'ANALYZING' | 'ARCHIVED'

  @IsOptional()
  @IsISO8601()
  collectedAt?: string; // ex.: "2025-11-16T20:15:00Z"

  @IsOptional()
  @IsString()
  collectedByUserId?: string;

  @IsOptional()
  // JSON arbitrário para cadeia de custódia (objeto/array/valores)
  // Se quiser forçar a ser objeto, troque por: @IsObject() chainOfCustody?: Record<string, any>;
  chainOfCustody?: any;
}
