import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestResultDto } from './dto/create-test-result.dto';
import { UpdateTestResultDto } from './dto/update-test-result.dto';
import {
  FinalResultStatus,
  Prisma,
  TestOutcome,
} from '@prisma/client';

type ListParams = {
  q?: string;
  outcome?: TestOutcome;
  finalStatus?: FinalResultStatus;
  labId?: string;
  sampleId?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  limit?: number;
  cursor?: string | null;
};

export interface PdfResultDTO {
  id: string;
  outcome: string | null;
  finalStatus: string | null;
  reportedAt: Date | null;
  pdfReportUrl: string | null;
  detailsJson: any;

  // Laboratório
  lab: { name: string; code: string };

  // Amostra / Ordem
  sample: { id: string; code: string; testOrderId: string | null };

  // Enriquecimentos
  athlete?: { id: string; fullName: string; cbfCode: string };
  club?: { id: string; name: string };
  federation?: { id: string; name: string; uf: string };
}

@Injectable()
export class TestResultsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um resultado 1:1 para a amostra.
   */
  async getPdfData(id: string): Promise<PdfResultDTO> {
    // 1) Busca resultado + sample (code/testOrderId) + lab
    const result = await this.prisma.testResult.findUnique({
      where: { id },
      select: {
        id: true,
        outcome: true,
        finalStatus: true,
        reportedAt: true,
        pdfReportUrl: true,
        detailsJson: true,
        lab: { select: { name: true, code: true } },
        sample: { select: { id: true, code: true, testOrderId: true } },
      },
    });
    if (!result) throw new NotFoundException('Resultado não encontrado');

    // 2) Enriquecer com dados da ordem (athleteId/clubId/federationId)
    let athleteBlock: PdfResultDTO['athlete'];
    let clubBlock: PdfResultDTO['club'];
    let fedBlock: PdfResultDTO['federation'];

    if (result.sample?.testOrderId) {
      const order = await this.prisma.testOrder.findUnique({
        where: { id: result.sample.testOrderId },
        select: {
          athleteId: true,
          clubId: true,
          federationId: true,
        },
      });

      if (order?.athleteId) {
        const athlete = await this.prisma.athlete.findUnique({
          where: { id: order.athleteId },
          select: { id: true, fullName: true, cbfCode: true },
        });
        if (athlete) {
          athleteBlock = {
            id: athlete.id,
            fullName: athlete.fullName,
            cbfCode: athlete.cbfCode,
          };
        }
      }

      if (order?.clubId) {
        const club = await this.prisma.club.findUnique({
          where: { id: order.clubId },
          select: { id: true, name: true },
        });
        if (club) {
          clubBlock = { id: club.id, name: club.name };
        }
      }

      if (order?.federationId) {
        const fed = await this.prisma.federation.findUnique({
          where: { id: order.federationId },
          select: { id: true, name: true, uf: true },
        });
        if (fed) {
          fedBlock = { id: fed.id, name: fed.name, uf: fed.uf };
        }
      }
    }

    return {
      ...result,
      lab: result.lab!,
      sample: {
        id: result.sample!.id,
        code: result.sample!.code,
        testOrderId: result.sample!.testOrderId,
      },
      athlete: athleteBlock,
      club: clubBlock,
      federation: fedBlock,
    };
  }
  
  async create(dto: CreateTestResultDto) {
  // 1) validações básicas de presença
  if (!dto.sampleId) {
    throw new BadRequestException('sampleId é obrigatório.');
  }
  if (!dto.labId) {
    throw new BadRequestException('labId é obrigatório.');
  }
  if (!dto.outcome) {
    throw new BadRequestException('outcome é obrigatório (NEGATIVE | AAF | INCONCLUSIVE).');
  }

  // 2) normaliza enums (aceita string ou enum)
  const normalizedOutcome =
    typeof dto.outcome === 'string'
      ? (dto.outcome.toUpperCase() as keyof typeof TestOutcome)
      : (dto.outcome as keyof typeof TestOutcome);

  if (!TestOutcome[normalizedOutcome]) {
    throw new BadRequestException('outcome inválido. Use NEGATIVE | AAF | INCONCLUSIVE.');
  }

  let normalizedFinal: FinalResultStatus | null = null;
  if (dto.finalStatus) {
    const key =
      typeof dto.finalStatus === 'string'
        ? (dto.finalStatus.toUpperCase() as keyof typeof FinalResultStatus)
        : (dto.finalStatus as keyof typeof FinalResultStatus);
    if (!FinalResultStatus[key]) {
      throw new BadRequestException('finalStatus inválido. Use CONFIRMED | UNDER_APPEAL | RETRACTED.');
    }
    normalizedFinal = FinalResultStatus[key];
  }

  // 3) garante que a amostra existe
  const sample = await this.prisma.sample.findUnique({
    where: { id: dto.sampleId },
    select: { id: true },
  });
  if (!sample) {
    throw new NotFoundException('Amostra não encontrada.');
  }

  // 4) já existe resultado para essa amostra?
  const existing = await this.prisma.testResult.findUnique({
    where: { sampleId: dto.sampleId },
    select: { id: true },
  });
  if (existing) {
    throw new ConflictException('Esta amostra já possui um resultado cadastrado.');
  }

  // 5) garante que o laboratório existe/ativo (opcional: checar isActive)
  const lab = await this.prisma.lab.findUnique({
    where: { id: dto.labId },
    select: { id: true, isActive: true },
  });
  if (!lab) {
    throw new NotFoundException('Laboratório não encontrado.');
  }
  // Se quiser bloquear lab inativo:
  // if (!lab.isActive) throw new BadRequestException('Laboratório inativo.');

  // 6) normaliza datas e JSON
  const reportedAt =
    dto.reportedAt ? new Date(dto.reportedAt) : new Date();

  // detailsJson: aceita objeto; se vier null explicitamente, gravamos como NULL de banco
  const detailsValue =
    dto.detailsJson === null
      ? Prisma.JsonNull
      : dto.detailsJson ?? undefined; // undefined = não tocar no campo

  // 7) cria o resultado
  try {
    const created = await this.prisma.testResult.create({
      data: {
        sampleId: dto.sampleId,
        labId: dto.labId,
        outcome: TestOutcome[normalizedOutcome],
        reportedAt,
        finalStatus: normalizedFinal,               // pode ser null
        pdfReportUrl: dto.pdfReportUrl ?? null,     // pode ser null
        detailsJson: detailsValue,                  // Json | null | undefined
      },
      select: {
        id: true,
        sampleId: true,
        labId: true,
        outcome: true,
        finalStatus: true,
        reportedAt: true,
        pdfReportUrl: true,
      },
    });

    return created;
  } catch (e: any) {
    // Prisma P2002 => violação de unique (sampleId único)
    if (e?.code === 'P2002' && Array.isArray(e.meta?.target) && e.meta.target.includes('TestResult_sampleId_key')) {
      throw new ConflictException('Esta amostra já possui um resultado cadastrado.');
    }
    throw e;
  }
}

  /**
   * Lista com filtros e paginação por cursor.
   */
  async findAll(params: ListParams) {
    const {
      q,
      outcome,
      finalStatus,
      labId,
      sampleId,
      from,
      to,
      limit = 20,
      cursor,
    } = params;

    const take = Math.min(Number(limit) || 20, 100);

    const where: Prisma.TestResultWhereInput = {};

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { id: { startsWith: term } },
        { sampleId: { startsWith: term } },
        { labId: { startsWith: term } },
        // por código da amostra
        { sample: { code: { contains: term, mode: Prisma.QueryMode.insensitive } } },
        // por nome do laboratório
        { lab: { name: { contains: term, mode: Prisma.QueryMode.insensitive } } },
      ];
    }

    if (outcome) where.outcome = outcome;
    if (finalStatus) where.finalStatus = finalStatus;
    if (labId) where.labId = labId;
    if (sampleId) where.sampleId = sampleId;

    // filtro por data do laudo (reportedAt)
    if (from || to) {
      const reportedFilter: Prisma.DateTimeFilter = {};
      if (from) {
        // from 00:00:00
        const start = new Date(`${from}T00:00:00`);
        reportedFilter.gte = start;
      }
      if (to) {
        // to 23:59:59.999
        const end = new Date(`${to}T23:59:59.999`);
        reportedFilter.lte = end;
      }
      where.reportedAt = reportedFilter;
    }

    const items = await this.prisma.testResult.findMany({
      where,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { reportedAt: 'desc' },
      select: {
      id: true,
      outcome: true,
      finalStatus: true,
      reportedAt: true,
      pdfReportUrl: true,
      labId: true,
      sampleId: true,
      lab: { select: { id: true, name: true } },
      sample: { select: { id: true, code: true, testOrderId: true } },
    }
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;

    return {
      items,
      pageInfo: {
        hasNextPage: !!nextCursor,
        nextCursor,
      },
    };
  }

  /**
   * Detalhe de um resultado (inclui detailsJson).
   */
  async findOne(id: string) {
    const result = await this.prisma.testResult.findUnique({
      where: { id },
      include: {
        sample: { select: { id: true, code: true, testOrderId: true } },
        lab: { select: { id: true, name: true, code: true } },
      },
    });
    if (!result) throw new NotFoundException('Test result not found');
    return result;
  }

  /**
   * Atualização parcial do laudo (outcome/finalStatus/reportedAt/pdf/detailsJson).
   */
  async update(id: string, dto: UpdateTestResultDto) {
    // valida existência
    const exists = await this.prisma.testResult.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Test result not found');

    let reportedAtUpdate: Date | undefined = undefined;
    if (dto.reportedAt !== undefined) {
      const d = new Date(dto.reportedAt);
      if (isNaN(d.getTime())) {
        throw new BadRequestException('Invalid reportedAt');
      }
      reportedAtUpdate = d;
    }

    const updated = await this.prisma.testResult.update({
      where: { id },
      data: {
        ...(dto.outcome ? { outcome: dto.outcome } : {}),
        ...(dto.finalStatus !== undefined ? { finalStatus: dto.finalStatus } : {}),
        ...(reportedAtUpdate !== undefined ? { reportedAt: reportedAtUpdate } : {}),
        ...(dto.pdfReportUrl !== undefined ? { pdfReportUrl: dto.pdfReportUrl } : {}),
        ...(dto.detailsJson !== undefined ? { detailsJson: dto.detailsJson } : {}),
      },
      include: {
        sample: { select: { id: true, code: true, testOrderId: true } },
        lab: { select: { id: true, name: true, code: true } },
      },
    });

    return updated;
  }
}
