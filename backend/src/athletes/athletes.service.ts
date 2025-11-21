import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import * as crypto from 'crypto';

@Injectable()
export class AthletesService {
  constructor(private prisma: PrismaService) {}

  private hashCpf(cpf: string) {
    // simplificado: em produção, usar cifra adequada + salt
    return crypto.createHash('sha256').update(cpf).digest('hex');
  }

  async create(dto: CreateAthleteDto) {
    const cpfHash = this.hashCpf(dto.cpf);
    return this.prisma.athlete.create({
      data: {
        cbfCode: dto.cbfCode,
        fullName: dto.fullName,
        birthDate: new Date(dto.birthDate),
        nationality: dto.nationality,
        cpfHash,
        sex: dto.sex,
      },
    });
  }

  async findAll(params: {
    q?: string;
    status?: string;
    take?: number;
    cursor?: string | null;
  }) {
    const { q, status, take = 50, cursor } = params;

    return this.prisma.athlete.findMany({
      where: {
        status: status as any || undefined,
        ...(q && {
          OR: [
            { cbfCode: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      take,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.athlete.findUnique({ where: { id } });
  }
}
