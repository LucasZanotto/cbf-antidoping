import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async search(params: { q?: string; federationId?: string; limit?: number }) {
    const { q = '', federationId, limit = 10 } = params;
    return this.prisma.club.findMany({
      where: {
        AND: [
          federationId ? { federationId } : {},
          q
            ? { name: { contains: q, mode: 'insensitive' } }
            : {},
        ],
      },
      orderBy: [{ name: 'asc' }],
      take: Math.min(Math.max(limit, 1), 50),
      select: { id: true, name: true, federationId: true },
    });
  }
}
