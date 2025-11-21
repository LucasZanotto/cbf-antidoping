import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../api/api';
import './SampleDetail.css';

const STATUS = ['SEALED', 'SHIPPED', 'RECEIVED', 'ANALYZING', 'ARCHIVED'];

export default function SampleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sample, setSample] = useState(null);
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/samples/${id}`);
      setSample(data);
      setStatus(data.status);
    } catch (e) {
      console.error(e);
      setSample(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveStatus() {
    if (!status) return;
    setSaving(true);
    try {
      await api.patch(`/samples/${id}`, { status });
      alert('Status atualizado!');
      await load();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar status.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="sd-loading">Carregando…</div>
      </Layout>
    );
  }

  if (!sample) {
    return (
      <Layout>
        <div className="sd-empty">Amostra não encontrada.</div>
        <button className="btn-ghost" onClick={() => navigate(-1)}>Voltar</button>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="sd-header">
        <h2 className="sd-title">Amostra {sample.code}</h2>
        <div className="sd-actions">
          <Link to="/samples" className="btn-ghost">Voltar</Link>
        </div>
      </div>

      <div className="sd-grid">
        <div className="card">
          <div className="row two">
            <div>
              <label>Tipo</label>
              <input className="input" type="text" readOnly value={sample.type} />
            </div>
            <div>
              <label>Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="row two">
            <div>
              <label>Código</label>
              <input className="input" type="text" readOnly value={sample.code} />
            </div>
            <div>
              <label>Coletada em</label>
              <input
                className="input"
                type="text"
                readOnly
                value={sample.collectedAt ? new Date(sample.collectedAt).toLocaleString() : '—'}
              />
            </div>
          </div>

          <div className="row two">
            <div>
              <label>Ordem (ID)</label>
              <input className="input mono" type="text" readOnly value={sample.testOrderId} />
            </div>
            <div>
              <label>Coletada por (User)</label>
              <input className="input mono" type="text" readOnly value={sample.collectedByUserId || '—'} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" disabled={saving} onClick={saveStatus}>
              {saving ? 'Salvando…' : 'Salvar status'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Cadeia de Custódia</h3>
          <pre className="json-preview">
{JSON.stringify(sample.chainOfCustodyJson || {}, null, 2)}
          </pre>
        </div>
      </div>
    </Layout>
  );
}
