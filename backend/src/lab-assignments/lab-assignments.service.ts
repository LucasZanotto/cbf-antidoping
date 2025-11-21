import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, LabAssignmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabAssignmentDto } from './dto/create-lab-assignment.dto';
import { UpdateLabAssignmentDto } from './dto/update-lab-assignment.dto';

type ListParams = {
  q?: string;
  labId?: string;
  status?: LabAssignmentStatus;
  limit?: number;
  cursor?: string | null;
};

@Injectable()
export class LabAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLabAssignmentDto) {
    // valida ordem
    const order = await this.prisma.testOrder.findUnique({
      where: { id: dto.testOrderId },
      select: { id: true },
    });
    if (!order) throw new NotFoundException('Test order not found');

    // valida lab
    const lab = await this.prisma.lab.findUnique({
      where: { id: dto.labId },
      select: { id: true, isActive: true },
    });
    if (!lab) throw new NotFoundException('Lab not found');
    if (lab.isActive === false) {
      throw new BadRequestException('Lab is not active');
    }

    const assignedAt = dto.assignedAt ? new Date(dto.assignedAt) : new Date();
    if (isNaN(assignedAt.getTime())) {
      throw new BadRequestException('Invalid assignedAt');
    }

    const created = await this.prisma.labAssignment.create({
      data: {
        testOrderId: dto.testOrderId,
        labId: dto.labId,
        assignedAt,
        status: dto.status ?? LabAssignmentStatus.AWAITING_PICKUP,
      },
      select: { id: true },
    });

    return created;
  }

  async findAll(params: ListParams) {
    const { q, labId, status, limit = 20, cursor } = params;
    const take = Math.min(Number(limit) || 20, 100);

    const where: Prisma.LabAssignmentWhereInput = {};

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { id: { startsWith: term } },
        { testOrderId: { startsWith: term } },
        { labId: { startsWith: term } },
        { lab: { name: { contains: term, mode: Prisma.QueryMode.insensitive } } },
        { lab: { code: { contains: term, mode: Prisma.QueryMode.insensitive } } },
      ];
    }
    if (labId) where.labId = labId;
    if (status) where.status = status;

    const items = await this.prisma.labAssignment.findMany({
      where,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { assignedAt: 'desc' },
      select: {
        id: true,
        testOrderId: true,
        labId: true,
        assignedAt: true,
        status: true,
        lab: { select: { name: true, code: true } },
      },
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;

    return {
      items,
      pageInfo: { hasNextPage: !!nextCursor, nextCursor },
    };
  }

  async update(id: string, dto: UpdateLabAssignmentDto) {
    const exists = await this.prisma.labAssignment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Lab assignment not found');

    const updated = await this.prisma.labAssignment.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        testOrderId: true,
        labId: true,
        assignedAt: true,
        status: true,
        lab: { select: { name: true, code: true } },
      },
    });

    return updated;
  }

  async findOne(id: string) {
    const row = await this.prisma.labAssignment.findUnique({
      where: { id },
      select: {
        id: true,
        testOrderId: true,
        labId: true,
        assignedAt: true,
        status: true,
        lab: { select: { name: true, code: true } },
      },
    });
    if (!row) throw new NotFoundException('Lab assignment not found');
    return row;
  }
}
