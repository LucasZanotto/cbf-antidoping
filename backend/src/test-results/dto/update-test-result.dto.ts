import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { FinalResultStatus, TestOutcome } from '@prisma/client';

export class UpdateTestResultDto {
  @IsOptional()
  @IsEnum(TestOutcome)
  outcome?: TestOutcome;

  @IsOptional()
  @IsEnum(FinalResultStatus)
  finalStatus?: FinalResultStatus | null;

  @IsOptional()
  @IsISO8601()
  reportedAt?: string;

  @IsOptional()
  @IsUrl()
  pdfReportUrl?: string | null;

  @IsOptional()
  detailsJson?: Record<string, any>;
}
