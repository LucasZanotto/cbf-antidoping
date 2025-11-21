import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FederationsService {
  constructor(private prisma: PrismaService) {}

  async search(params: { q?: string; limit?: number }) {
    const { q = '', limit = 10 } = params;

    const where: Prisma.FederationWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { uf:   { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    return this.prisma.federation.findMany({
      where,
      orderBy: { uf: 'asc' },
      take: Math.min(Math.max(limit, 1), 50),
      select: { id: true, name: true, uf: true },
    });
  }
}
