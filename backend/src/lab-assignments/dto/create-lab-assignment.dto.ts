import { IsISO8601, IsOptional, IsString, IsEnum } from 'class-validator';
import { LabAssignmentStatus } from '@prisma/client';

export class CreateLabAssignmentDto {
  @IsString()
  testOrderId!: string;

  @IsString()
  labId!: string;

  @IsOptional()
  @IsEnum(LabAssignmentStatus)
  status?: LabAssignmentStatus; // default no service: AWAITING_PICKUP

  @IsOptional()
  @IsISO8601()
  assignedAt?: string; // ISO string; se vazio, service usa new Date()
}
