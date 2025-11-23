import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TestReason, TestPriority } from '@prisma/client';
import { Transform } from 'class-transformer';

function emptyToUndefined(value: any) {
  return value === '' || value === null ? undefined : value;
}

export class CreateTestOrderDto {
  // federationId você está usando UUID de verdade, então pode manter IsUUID
  @IsUUID()
  federationId!: string;

  // clubId usa IDs tipo "seed-club-1", então NÃO pode ser IsUUID
  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyToUndefined(value))
  clubId?: string;

  // athleteId está vindo como UUID, então pode manter IsUUID
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => emptyToUndefined(value))
  athleteId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyToUndefined(value))
  matchId?: string; // opcional, pode vir vazio

  @IsEnum(TestReason)
  reason!: TestReason; // IN_COMPETITION | OUT_OF_COMPETITION | TARGETED | RANDOM

  @IsEnum(TestPriority)
  priority!: TestPriority; // LOW | NORMAL | HIGH | URGENT
}
