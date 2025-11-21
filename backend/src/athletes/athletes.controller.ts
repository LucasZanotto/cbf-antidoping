import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AthleteStatus } from '@prisma/client';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import * as bcrypt from 'bcryptjs';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

// ===== DTOs =====
class CreateAthleteDto {
  @IsString() cbfCode!: string;          // ex: 2025-000001
  @IsString() fullName!: string;
  @IsDateString() birthDate!: string;     // ISO: 1998-03-10T00:00:00Z ou '1998-03-10'
  @IsString() nationality!: string;       // ex: 'BRA'
  @IsString() @Length(11, 11) cpf!: string; // somente dígitos
  @IsString() @IsIn(['M', 'F']) sex!: string;

  @IsOptional()
  @IsEnum(AthleteStatus)
  status?: AthleteStatus;                 // ELIGIBLE | SUSPENDED | INACTIVE
}

// ===== Controller =====
@Controller('athletes') // lembre: app.setGlobalPrefix('api/v1') no main.ts
export class AthletesController {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /api/v1/athletes?q=&status=&cursor=&limit=
   * Lista paginada por cursor. Filtros por nome/código e status.
   * Liberado publicamente (útil para lookups).
   */
  @Public()
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where: Prisma.AthleteWhereInput = {};

    if (q && q.trim()) {
      where.OR = [
        { fullName: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { cbfCode: { contains: q, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (status) {
      const st = status.toUpperCase() as keyof typeof AthleteStatus;
      if (AthleteStatus[st]) {
        where.status = AthleteStatus[st];
      }
    }

    const items = await this.prisma.athlete.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      select: {
        id: true,
        cbfCode: true,
        fullName: true,
        birthDate: true,
        nationality: true,
        sex: true,
        status: true,
        createdAt: true,
      },
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;

    return {
      items,
      pageInfo: { hasNextPage: Boolean(nextCursor), nextCursor },
    };
  }

  /**
   * GET /api/v1/athletes/:id
   * Detalhe simples de atleta (autenticado).
   */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id },
      select: {
        id: true,
        cbfCode: true,
        fullName: true,
        birthDate: true,
        nationality: true,
        sex: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!athlete) throw new BadRequestException('Atleta não encontrado.');
    return athlete;
  }

  /**
   * POST /api/v1/athletes
   * Criação de atleta (restrito a ADMIN_CBF | FED_USER | CLUB_USER).
   * Converte `birthDate` para Date e guarda `cpfHash` com bcrypt.
   */
  @Roles('ADMIN_CBF', 'FED_USER', 'CLUB_USER')
  @Post()
  async create(@Body() dto: CreateAthleteDto) {
    // normalizar CPF (somente dígitos)
    const cpfDigits = (dto.cpf || '').replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      throw new BadRequestException('CPF deve conter 11 dígitos.');
    }

    // hash simples (se quiser, troque por SHA-256 para ser determinístico)
    const cpfHash = await bcrypt.hash(cpfDigits, 10);

    // checar duplicidade por cbfCode
    const exists = await this.prisma.athlete.findUnique({
      where: { cbfCode: dto.cbfCode },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException('CBF Code já existente.');
    }

    const created = await this.prisma.athlete.create({
      data: {
        cbfCode: dto.cbfCode,
        fullName: dto.fullName,
        birthDate: new Date(dto.birthDate),
        nationality: dto.nationality,
        cpfHash,
        sex: dto.sex,
        status: dto.status ?? AthleteStatus.ELIGIBLE,
      },
      select: {
        id: true,
        cbfCode: true,
        fullName: true,
        birthDate: true,
        nationality: true,
        sex: true,
        status: true,
        createdAt: true,
      },
    });

    return created;
  }
}
