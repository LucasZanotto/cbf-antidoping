import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import AsyncSelect from '../components/AsyncSelect';
import api from '../api/api';
import { searchLabs, searchSamples, searchTestOrders } from '../api/lookups';
import './resultCreate.css';

const OUTCOMES = ['NEGATIVE', 'AAF', 'INCONCLUSIVE'];
const FINAL_STATUSES = ['CONFIRMED', 'UNDER_APPEAL', 'RETRACTED'];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResultCreate() {
  const q = useQuery();
  const navigate = useNavigate();

  // pré-preenche a partir da designação
  const qsLabId = q.get('labId') || '';
  const qsOrderId = q.get('testOrderId') || '';

  const [labId, setLabId] = useState(qsLabId);
  const [testOrderId, setTestOrderId] = useState(qsOrderId);
  const [sampleId, setSampleId] = useState('');
  const [reportedAt, setReportedAt] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [outcome, setOutcome] = useState('NEGATIVE');
  const [finalStatus, setFinalStatus] = useState('');
  const [pdfReportUrl, setPdfReportUrl] = useState('');
  const [detailsText, setDetailsText] = useState(`{
  "method": "GC/MS",
  "matrix": "Urine",
  "panel": ["EPO", "Anabolic agents"],
  "notes": "Sem indícios de adulteração."
}`);

  const [saving, setSaving] = useState(false);

  // quando mudar a ordem, limpamos a amostra
  useEffect(() => {
    setSampleId('');
  }, [testOrderId]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!sampleId || !labId || !outcome) {
      alert('Selecione Laboratório, Amostra e Outcome.');
      return;
    }

    // valida o JSON de detalhes
    let detailsJson = undefined;
    if (detailsText && detailsText.trim()) {
      try {
        detailsJson = JSON.parse(detailsText);
      } catch (err) {
        alert('Cadeia de detalhes (JSON) inválida.');
        return;
      }
    }

    setSaving(true);
    try {
      await api.post('/test-results', {
        sampleId,
        labId,
        outcome,
        reportedAt: reportedAt ? new Date(reportedAt).toISOString() : undefined,
        finalStatus: finalStatus || undefined,
        pdfReportUrl: pdfReportUrl || undefined,
        detailsJson,
      });
      alert('Resultado criado com sucesso.');
      navigate('/results');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar resultado.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="rc-header">
        <h2 className="rc-title">Novo Resultado</h2>
      </div>

      <form className="rc-form" onSubmit={handleSubmit}>
        <div className="row">
          <label>Ordem de Teste (filtra amostras)</label>
          <AsyncSelect
            value={testOrderId}
            onChange={(val) => setTestOrderId(val || '')}
            fetchOptions={searchTestOrders}
            placeholder="Buscar ordem por ID/atleta/clube…"
          />
        </div>

        <div className="row">
          <label>Amostra</label>
          <AsyncSelect
            value={sampleId}
            onChange={(val) => setSampleId(val || '')}
            // passa testOrderId para filtrar
            fetchOptions={(q) => searchSamples(q, testOrderId)}
            placeholder={testOrderId ? "Buscar amostra vinculada à ordem…" : "Selecione a ordem para filtrar amostras…"}
            disabled={!testOrderId}
          />
        </div>

        <div className="row">
          <label>Laboratório</label>
          <AsyncSelect
            value={labId}
            onChange={(val) => setLabId(val || '')}
            fetchOptions={searchLabs}
            placeholder="Buscar laboratório…"
          />
        </div>

        <div className="row two">
          <div>
            <label>Resultado (Outcome)</label>
            <select className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
              {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label>Status Final (opcional)</label>
            <select className="input" value={finalStatus} onChange={(e) => setFinalStatus(e.target.value)}>
              <option value="">—</option>
              {FINAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="row two">
          <div>
            <label>Laudo em</label>
            <input
              className="input"
              type="datetime-local"
              value={reportedAt}
              onChange={(e) => setReportedAt(e.target.value)}
            />
          </div>
          <div>
            <label>PDF do Laudo (URL)</label>
            <input
              className="input"
              type="url"
              placeholder="https://…"
              value={pdfReportUrl}
              onChange={(e) => setPdfReportUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <label>Detalhes do laudo (JSON)</label>
          <textarea
            className="input mono"
            rows={10}
            value={detailsText}
            onChange={(e) => setDetailsText(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Criar resultado'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
