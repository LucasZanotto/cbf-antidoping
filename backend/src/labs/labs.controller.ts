import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('labs')
export class LabsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const take = Math.min(Number(limit) || 20, 100);

    const where: any = { isActive: true };
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: 'insensitive' } },
        { code: { contains: q.trim(), mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.lab.findMany({
      where,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;
    return { items, pageInfo: { hasNextPage: !!nextCursor, nextCursor } };
  }

  // opcional: rota de lookup direta (mesma lógica, sem paginação)
  @Get('lookup')
  async lookup(@Query('q') q?: string, @Query('limit') limit?: string) {
    const take = Math.min(Number(limit) || 10, 50);
    const where: any = { isActive: true };
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: 'insensitive' } },
        { code: { contains: q.trim(), mode: 'insensitive' } },
      ];
    }
    const items = await this.prisma.lab.findMany({
      where,
      take,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    });
    return { items };
  }

  @Post()
  async create(@Body() dto: { name: string; code: string; country?: string; isActive?: boolean }) {
    if (!dto?.name || !dto?.code) {
      return { error: 'name e code são obrigatórios' };
    }
    const lab = await this.prisma.lab.create({
      data: {
        name: dto.name,
        code: dto.code, // precisa ser único
        country: dto.country ?? 'BR',
        isActive: dto.isActive ?? true,
      },
      select: { id: true, name: true, code: true, country: true, isActive: true },
    });
    return lab;
  }
}
