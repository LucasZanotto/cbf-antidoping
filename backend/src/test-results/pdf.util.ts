// src/test-results/pdf.util.ts
import PDFDocument from 'pdfkit';

export function generateResultPdfBuffer(result: {
  id: string;
  outcome: string | null;
  finalStatus?: string | null;
  reportedAt?: Date | null;
  pdfReportUrl?: string | null;
  lab?: { name?: string | null; code?: string | null } | null;
  sample?: { code?: string | null; testOrderId?: string | null } | null;
  detailsJson?: any;
}) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Cabeçalho
    doc.fontSize(18).text('Laudo Antidoping — CBF', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666').text(`Resultado ID: ${result.id}`);
    doc.moveDown();

    // Bloco principal
    doc.fillColor('#000').fontSize(12);
    const f = (v?: string | null) => (v ? v : '—');

    doc.text(`Outcome: ${f(result.outcome)}`);
    doc.text(`Status Final: ${f(result.finalStatus)}`);
    doc.text(`Laudo em: ${result.reportedAt ? new Date(result.reportedAt).toLocaleString() : '—'}`);
    doc.text(`Laboratório: ${f(result.lab?.name)} ${result.lab?.code ? `(${result.lab.code})` : ''}`);
    doc.text(`Amostra: ${f(result.sample?.code)}`);
    doc.text(`Ordem de Teste: ${f(result.sample?.testOrderId)}`);
    if (result.pdfReportUrl) doc.text(`PDF externo: ${result.pdfReportUrl}`);

    doc.moveDown();

    // Detalhes (JSON)
    doc.fontSize(12).text('Detalhes (JSON):');
    doc.fontSize(10).fillColor('#111');
    const pretty = safePretty(result.detailsJson);
    doc.text(pretty, { width: 500 });

    doc.end();
  });
}

function safePretty(obj: any) {
  try { return JSON.stringify(obj ?? {}, null, 2); }
  catch { return String(obj ?? ''); }
}
