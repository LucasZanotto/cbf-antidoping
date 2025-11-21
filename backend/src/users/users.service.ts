import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, UserRole } from '@prisma/client';

type LookupArgs = { q?: string; role?: string; take: number };

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createInitialAdminIfNotExists() {
    const existing = await this.prisma.user.findFirst({
      where: { role: 'ADMIN_CBF' },
    });

    if (!existing) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);

      await this.prisma.user.create({
        data: {
          name: 'Admin CBF',
          email: 'admin@cbf.local',
          passwordHash: hash,
          role: 'ADMIN_CBF',
        },
      });
      // em produção, trocar essa senha via processo seguro
    }
  }

  async lookup({ q, role, take }: LookupArgs) {
    const where: Prisma.UserWhereInput = {
      isActive: true,
    };

    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (role) {
      const r = role.toUpperCase() as keyof typeof UserRole;
      if (UserRole[r]) where.role = UserRole[r];
    }

    const rows = await this.prisma.user.findMany({
      where,
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // shape direto para o front, mas mantemos { items } no controller
    return rows;
  }
}
