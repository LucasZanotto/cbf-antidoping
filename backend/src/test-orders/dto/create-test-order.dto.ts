import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TestReason, TestPriority } from '@prisma/client'; // <-- IMPORTA OS ENUMS

export class CreateTestOrderDto {
  @IsUUID()
  federationId!: string;

  @IsOptional()
  @IsUUID()
  clubId?: string;

  @IsOptional()
  @IsUUID()
  athleteId?: string;

  @IsOptional()
  @IsString()
  matchId?: string; // opcional, pode vir vazio

  @IsEnum(TestReason)
  reason!: TestReason; // IN_COMPETITION | OUT_OF_COMPETITION | TARGETED | RANDOM

  @IsEnum(TestPriority)
  priority!: TestPriority; // LOW | NORMAL | HIGH | URGENT
}
