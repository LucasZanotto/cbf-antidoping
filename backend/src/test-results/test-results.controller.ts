// src/test-results/test-results.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { TestResultsService } from './test-results.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { FinalResultStatus, TestOutcome } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('test-results')
export class TestResultsController {
  constructor(private service: TestResultsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('outcome') outcome?: string,
    @Query('finalStatus') finalStatus?: string,
    @Query('labId') labId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    // Normaliza outcome -> enum TestOutcome
    const outcomeEnum: TestOutcome | undefined =
      outcome && Object.values(TestOutcome).includes(outcome as TestOutcome)
        ? (outcome as TestOutcome)
        : undefined;

    // Normaliza finalStatus -> enum FinalResultStatus
    const finalStatusEnum: FinalResultStatus | undefined =
      finalStatus &&
      Object.values(FinalResultStatus).includes(finalStatus as FinalResultStatus)
        ? (finalStatus as FinalResultStatus)
        : undefined;

    return this.service.findAll({
      q,
      outcome: outcomeEnum,
      finalStatus: finalStatusEnum,
      labId,
      cursor: cursor || null,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const data = await this.service.getPdfData(id);

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const left = 50;
    const right = width - 50;
    let y = 780;
    const lineGap = 18;

    const drawLabel = (label: string, value?: string) => {
      page.drawText(label, { x: left, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
      if (value) {
        page.drawText(value, { x: left + 160, y, size: 11, font, color: rgb(0, 0, 0) });
      }
      y -= lineGap;
    };

    // título
    page.drawText('Laudo Antidoping — CBF', {
      x: left,
      y,
      size: 16,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 28;

    drawLabel('Resultado ID:', data.id);
    drawLabel('Outcome:', data.outcome ?? '—');
    drawLabel('Status Final:', data.finalStatus ?? '—');
    drawLabel('Laudo em:', data.reportedAt ? new Date(data.reportedAt).toLocaleString() : '—');

    y -= 8;

    drawLabel(
      'Laboratório:',
      `${data.lab?.name ?? '—'}${data.lab?.code ? ` (${data.lab.code})` : ''}`,
    );

    y -= 8;

    drawLabel('Amostra (código):', data.sample?.code ?? '—');
    drawLabel('Ordem de Teste:', data.sample?.testOrderId ?? '—');

    y -= 8;

    if (data.athlete) {
      drawLabel('Atleta:', `${data.athlete.fullName} — CBF ${data.athlete.cbfCode}`);
    } else {
      drawLabel('Atleta:', '—');
    }
    if (data.club) {
      drawLabel('Clube:', data.club.name);
    } else {
      drawLabel('Clube:', '—');
    }
    if (data.federation) {
      drawLabel('Federação:', `${data.federation.uf} — ${data.federation.name}`);
    } else {
      drawLabel('Federação:', '—');
    }

    y -= 12;

    // separador
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 24;

    // Detalhes JSON
    page.drawText('Detalhes (JSON):', { x: left, y, size: 12, font: fontBold });
    y -= lineGap;

    const detailsStr = JSON.stringify(data.detailsJson ?? {}, null, 2);

    const wrap = (text: string, maxChars = 90) => {
      const lines: string[] = [];
      const rawLines = text.split('\n');
      for (const rl of rawLines) {
        if (rl.length <= maxChars) {
          lines.push(rl);
        } else {
          let start = 0;
          while (start < rl.length) {
            lines.push(rl.slice(start, start + maxChars));
            start += maxChars;
          }
        }
      }
      return lines;
    };

    const detailLines = wrap(detailsStr, 90);
    for (const line of detailLines) {
      if (y < 60) {
        // nova página
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 780;
        page.drawText('Detalhes (JSON) — continuação', {
          x: left,
          y,
          size: 12,
          font: fontBold,
        });
        y -= 24;
      }
      page.drawText(line, { x: left, y, size: 10, font });
      y -= 14;
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="laudo-${id}.pdf"`);
    return res.send(Buffer.from(pdfBytes));
  }
}
