import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { FinalResultStatus, TestOutcome } from '@prisma/client';

export class CreateTestResultDto {
  @IsString()
  sampleId!: string;

  @IsString()
  labId!: string;

  @IsOptional()
  @IsISO8601()
  reportedAt?: string; // ISO (YYYY-MM-DDTHH:mm:ssZ)

  @IsEnum(TestOutcome)
  outcome!: TestOutcome;

  @IsOptional()
  detailsJson?: Record<string, any>;

  @IsOptional()
  @IsUrl()
  pdfReportUrl?: string;

  @IsOptional()
  @IsEnum(FinalResultStatus)
  finalStatus?: FinalResultStatus;
}
