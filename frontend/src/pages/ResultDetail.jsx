import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../api/api';
import './ResultDetail.css';

const OUTCOMES = ['NEGATIVE', 'AAF', 'INCONCLUSIVE'];
const FINAL_STATUSES = ['CONFIRMED', 'UNDER_APPEAL', 'RETRACTED'];

export default function ResultDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  // campos editáveis
  const [outcome, setOutcome] = useState('');
  const [finalStatus, setFinalStatus] = useState('');
  const [reportedAt, setReportedAt] = useState('');
  const [pdfReportUrl, setPdfReportUrl] = useState('');
  const [detailsText, setDetailsText] = useState('');
  const [editDetails, setEditDetails] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/test-results/${id}`);
      setResult(data);
      setOutcome(data.outcome || '');
      setFinalStatus(data.finalStatus || '');
      setPdfReportUrl(data.pdfReportUrl || '');
      setReportedAt(data.reportedAt ? data.reportedAt.slice(0,16) : ''); // ISO → yyyy-mm-ddThh:mm
      setDetailsText(JSON.stringify(data.detailsJson ?? {}, null, 2));
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      let detailsJson = undefined;
      if (editDetails) {
        try {
          detailsJson = detailsText ? JSON.parse(detailsText) : {};
        } catch {
          alert('O JSON de detalhes está inválido.');
          setSaving(false);
          return;
        }
      }
      await api.patch(`/test-results/${id}`, {
        outcome,
        finalStatus: finalStatus || null,
        reportedAt: reportedAt || null,
        pdfReportUrl: pdfReportUrl || null,
        ...(editDetails ? { detailsJson } : {}),
      });
      alert('Resultado atualizado!');
      await load();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="rd-loading">Carregando…</div>
      </Layout>
    );
  }

  if (!result) {
    return (
      <Layout>
        <div className="rd-empty">Resultado não encontrado.</div>
        <button className="btn-ghost" onClick={() => navigate(-1)}>Voltar</button>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="rd-header">
        <h2 className="rd-title">Resultado da Amostra {result.sample?.code || result.sampleId}</h2>
        <div className="rd-actions">
          <Link to="/results" className="btn-ghost">Voltar</Link>
        </div>
      </div>

      <div className="rd-grid">
        <div className="card">
          <div className="row two">
            <div>
              <label>Outcome</label>
              <select className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label>Final Status</label>
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
              <label>PDF do laudo (URL)</label>
              <div className="with-btn">
                <input
                  className="input"
                  type="url"
                  value={pdfReportUrl}
                  onChange={(e) => setPdfReportUrl(e.target.value)}
                  placeholder="https://…"
                />
                {result.pdfReportUrl && (
                  <a className="btn-ghost" href={result.pdfReportUrl} target="_blank" rel="noreferrer">Abrir</a>
                )}
              </div>
            </div>
          </div>

          <div className="row two">
            <div>
              <label>Amostra (ID)</label>
              <input className="input mono" type="text" readOnly value={result.sampleId} />
            </div>
            <div>
              <label>Laboratório (ID)</label>
              <input className="input mono" type="text" readOnly value={result.labId} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" disabled={saving} onClick={save}>
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="rd-details-head">
            <h3 className="card-title">Detalhes (JSON)</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={editDetails}
                onChange={(e) => setEditDetails(e.target.checked)}
              />
              Editar
            </label>
          </div>

          {editDetails ? (
            <textarea
              className="json-editor"
              value={detailsText}
              onChange={(e) => setDetailsText(e.target.value)}
              spellCheck="false"
            />
          ) : (
            <pre className="json-preview">
{JSON.stringify(result.detailsJson || {}, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </Layout>
  );
}
