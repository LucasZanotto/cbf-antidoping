import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';

@Injectable()
export class LabsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLabDto) {
    return this.prisma.lab.create({
      data: {
        name: dto.name,
        code: dto.code,
        country: dto.country,
      },
    });
  }

  findAll() {
    return this.prisma.lab.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const lab = await this.prisma.lab.findUnique({ where: { id } });
    if (!lab) throw new NotFoundException('Lab not found');
    return lab;
  }

  async update(id: string, dto: UpdateLabDto) {
    await this.findOne(id);
    return this.prisma.lab.update({
      where: { id },
      data: dto,
    });
  }
}
