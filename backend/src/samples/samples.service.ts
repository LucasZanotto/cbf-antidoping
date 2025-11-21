// src/samples/samples.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { Prisma, SampleStatus, SampleType } from '@prisma/client';

type ListParams = {
  q?: string;
  type?: string;
  status?: string;
  testOrderId?: string;
  code?: string;
  cursor?: string | null;
  limit?: number;
};

type LookupParams = {
  q?: string;
  testOrderId?: string;
  limit?: number;
};

@Injectable()
export class SamplesService {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /samples
   * Suporta filtros: q, type, status, testOrderId, code + paginação por cursor
   */
  async list(params: ListParams) {
    const {
      q,
      type,
      status,
      testOrderId,
      code,
      cursor = null,
      limit = 20,
    } = params;

    const take = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where: Prisma.SampleWhereInput = {};

    if (q?.trim()) {
      where.OR = [
        { id: { startsWith: q.trim() } },
        { code: { contains: q.trim(), mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (testOrderId) where.testOrderId = testOrderId;

    if (code?.trim()) {
      where.code = { contains: code.trim(), mode: Prisma.QueryMode.insensitive };
    }

    if (type) {
      const t = type.toUpperCase() as keyof typeof SampleType;
      if (SampleType[t]) where.type = SampleType[t];
    }

    if (status) {
      const st = status.toUpperCase() as keyof typeof SampleStatus;
      if (SampleStatus[st]) where.status = SampleStatus[st];
    }

    const items = await this.prisma.sample.findMany({
      where,
      orderBy: { id: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        code: true,
        type: true,
        status: true,
        collectedAt: true,
        testOrderId: true,
        testOrder: { select: { id: true, priority: true, reason: true } },
      },
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;
    return {
      items,
      pageInfo: { hasNextPage: Boolean(nextCursor), nextCursor },
    };
  }

  /**
   * POST /samples
   */
async create(dto: CreateSampleDto) {
  // validações básicas
  if (!dto.testOrderId) {
    throw new BadRequestException('testOrderId é obrigatório.');
  }
  if (!dto.code || !dto.code.trim()) {
    throw new BadRequestException('code é obrigatório.');
  }
  if (!dto.type) {
    throw new BadRequestException('type é obrigatório (URINE|BLOOD).');
  }

  // garante que a ordem existe
  const order = await this.prisma.testOrder.findUnique({
    where: { id: dto.testOrderId },
    select: { id: true },
  });
  if (!order) throw new NotFoundException('Test order não encontrada.');

  // normalizações de enum
  const normalizedType =
    typeof dto.type === 'string'
      ? (dto.type.toUpperCase() as keyof typeof SampleType)
      : dto.type;
  if (!SampleType[normalizedType]) {
    throw new BadRequestException('type inválido. Use URINE ou BLOOD.');
  }

  let normalizedStatus: SampleStatus | undefined = undefined;
  if (dto.status) {
    const key =
      typeof dto.status === 'string'
        ? (dto.status.toUpperCase() as keyof typeof SampleStatus)
        : (dto.status as keyof typeof SampleStatus);
    if (!SampleStatus[key]) {
      throw new BadRequestException(
        'status inválido. Use SEALED|SHIPPED|RECEIVED|ANALYZING|ARCHIVED',
      );
    }
    normalizedStatus = SampleStatus[key];
  }

  // collectedAt
  const collectedAt =
    dto.collectedAt !== undefined
      ? dto.collectedAt
        ? new Date(dto.collectedAt)
        : null
      : null;

  // ⚠️ JSON: aceitar tanto dto.chainOfCustody (preferido) quanto dto.chainOfCustodyJson (legado)
  const rawChain =
    (dto as any).chainOfCustody !== undefined
      ? (dto as any).chainOfCustody
      : (dto as any).chainOfCustodyJson;

  const chainOfCustodyJson =
    rawChain === null
      ? Prisma.DbNull // grava NULL no banco
      : rawChain !== undefined
      ? (rawChain as Prisma.InputJsonValue) // objeto/array/valor JSON válido
      : undefined; // não envia => mantém default do Prisma

  const created = await this.prisma.sample.create({
    data: {
      testOrderId: dto.testOrderId,
      code: dto.code.trim(),
      type: SampleType[normalizedType],
      status: normalizedStatus ?? SampleStatus.SEALED,
      collectedAt,
      collectedByUserId:
        (dto as any).collectedByUserId !== undefined
          ? (dto as any).collectedByUserId
          : null,
      chainOfCustodyJson,
    },
    select: {
      id: true,
      code: true,
      type: true,
      status: true,
      collectedAt: true,
      testOrderId: true,
      collectedByUserId: true,
    },
  });

  return created;
}

  /**
   * GET /samples/lookup
   * Leve para selects assíncronos do front (q + testOrderId)
   */
  async lookup(params: LookupParams) {
    const { q, testOrderId, limit = 10 } = params;

    const where: Prisma.SampleWhereInput = {};
    if (q?.trim()) {
      where.OR = [
        { id: { startsWith: q.trim() } },
        { code: { contains: q.trim(), mode: Prisma.QueryMode.insensitive } },
      ];
    }
    if (testOrderId) where.testOrderId = testOrderId;

    const items = await this.prisma.sample.findMany({
      where,
      take: Math.min(Number(limit) || 10, 50),
      orderBy: { id: 'desc' },
      select: { id: true, code: true, type: true, testOrderId: true },
    });

    return { items };
  }

  /**
   * GET /samples/:id
   */
  async findOne(id: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: { testOrder: true },
    });
    if (!sample) throw new NotFoundException('Sample not found');
    return sample;
  }

  /**
   * PATCH /samples/:id
   */
  async update(id: string, dto: UpdateSampleDto) {
    const exists = await this.prisma.sample.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Sample not found');

    let nextStatus = exists.status;
    if (dto.status) {
      const st =
        typeof dto.status === 'string'
          ? (dto.status.toUpperCase() as keyof typeof SampleStatus)
          : dto.status;
      if (SampleStatus[st]) nextStatus = SampleStatus[st];
    }

    return this.prisma.sample.update({
  where: { id },
  data: {
    status: nextStatus,
    collectedAt:
      dto.collectedAt !== undefined
        ? dto.collectedAt
          ? new Date(dto.collectedAt)
          : null
        : exists.collectedAt,
    collectedByUserId:
      dto.collectedByUserId !== undefined
        ? dto.collectedByUserId
        : exists.collectedByUserId,

    // 👇 Correção para JSON nullable:
    chainOfCustodyJson:
      dto.chainOfCustody === null
        ? Prisma.DbNull            // ou Prisma.JsonNull, se quiser JSON null
        : dto.chainOfCustody !== undefined
          ? (dto.chainOfCustody as Prisma.InputJsonValue)
          : undefined, // mantém o valor atual
  },
  select: {
    id: true,
    code: true,
    type: true,
    status: true,
    collectedAt: true,
    testOrderId: true,
    collectedByUserId: true,
  },
});
  }
}
