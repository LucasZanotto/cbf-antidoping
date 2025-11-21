import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestOrderDto } from './dto/create-test-order.dto';
import { UpdateTestOrderDto } from './dto/update-test-order.dto';
import { Prisma, TestOrderStatus } from '@prisma/client';

type LookupArgs = { q?: string; take: number };

@Injectable()
export class TestOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTestOrderDto, userId: string) {
    const matchId = dto.matchId?.trim() ? dto.matchId.trim() : null;

    return this.prisma.testOrder.create({
      data: {
        createdByUserId: userId,
        federationId: dto.federationId,
        clubId: dto.clubId ?? null,
        athleteId: dto.athleteId ?? null,
        matchId, // null se vier vazio
        reason: dto.reason,
        priority: dto.priority,
      },
      select: {
        id: true,
        createdAt: true,
        reason: true,
        priority: true,
        status: true,
        federationId: true,
        clubId: true,
        athleteId: true,
        matchId: true,
      },
    });
  }

  /**
   * Lookup leve para selects do front.
   * OBS: como seu schema não define relation fields (ex.: `athlete Athlete? @relation(...)`),
   * não usamos filtros/seleções por `athlete`/`club` diretamente (o que dava erro de tipo).
   */
  async lookup({ q, take }: LookupArgs) {
    const where: Prisma.TestOrderWhereInput = {};

    if (q && q.trim()) {
      const term = q.trim();

      // Como não temos relations tipadas no modelo, filtramos por campos simples:
      // - id começando com o termo (quando colam um pedaço do UUID)
      // - athleteId/clubId/federationId começando com o termo (ajuda quem tem o id em mãos)
      where.OR = [
        { id: { startsWith: term } },
        { athleteId: { startsWith: term } },
        { clubId: { startsWith: term } },
        { federationId: { startsWith: term } },
        { matchId: { startsWith: term } },
      ];
    }

    const rows = await this.prisma.testOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        reason: true,
        priority: true,
        createdAt: true,
        // como não há relations definidas no schema atual, retornamos apenas os IDs
        athleteId: true,
        clubId: true,
        federationId: true,
      },
    });

    return rows;
  }

  async findAll(params: {
    status?: TestOrderStatus;
    federationId?: string;
    clubId?: string;
    athleteId?: string;
    matchId?: string;
    take?: number;
    cursor?: string | null;
  }) {
    const {
      status,
      federationId,
      clubId,
      athleteId,
      matchId,
      take = 50,
      cursor,
    } = params;

    const items = await this.prisma.testOrder.findMany({
      where: {
        status: status || undefined,
        federationId: federationId || undefined,
        clubId: clubId || undefined,
        athleteId: athleteId || undefined,
        matchId: matchId || undefined,
      },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        reason: true,
        priority: true,
        status: true,
        federationId: true,
        clubId: true,
        athleteId: true,
        matchId: true,
      },
    });

    const nextCursor =
      items.length === take ? items[items.length - 1].id : null;

    return {
      items,
      pageInfo: {
        hasNextPage: !!nextCursor,
        nextCursor,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.testOrder.findUnique({
      where: { id },
      include: {
        samples: true,
        labAssignments: true,
      },
    });
    if (!order) throw new NotFoundException('Test order not found');
    return order;
  }

  async update(id: string, dto: UpdateTestOrderDto) {
    const exists = await this.prisma.testOrder.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Test order not found');

    return this.prisma.testOrder.update({
      where: { id },
      data: {
        status: dto.status ?? exists.status,
        priority: dto.priority ?? exists.priority,
      },
      select: {
        id: true,
        status: true,
        priority: true,
        // updatedAt: true,
      },
    });
  }
}
