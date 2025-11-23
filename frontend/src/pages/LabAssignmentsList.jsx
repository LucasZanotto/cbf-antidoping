import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../api/api';
import AsyncSelect from '../components/AsyncSelect';
import { searchLabs, searchTestOrders } from '../api/lookups';
import './LabAssignmentsList.css';

const STATUSES = [
  'AWAITING_PICKUP',
  'IN_TRANSIT',
  'RECEIVED',
  'PROCESSING',
  'DONE',
];

export default function LabAssignmentsList() {
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, nextCursor: null });
  const [loading, setLoading] = useState(false);
  const [savingRow, setSavingRow] = useState(null);

  // filtros
  const [q, setQ] = useState('');
  const [labId, setLabId] = useState('');
  const [status, setStatus] = useState('');

  async function fetchAssignments({ append = false, cursor = null } = {}) {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (q) params.q = q;
      if (labId) params.labId = labId;
      if (status) params.status = status;
      if (cursor) params.cursor = cursor;

      const { data } = await api.get('/lab-assignments', { params });
      const newItems = data.items || [];
      setItems(prev => (append ? [...prev, ...newItems] : newItems));
      setPageInfo(data.pageInfo || { hasNextPage: false, nextCursor: null });
    } catch (e) {
      console.error('Erro ao carregar designações', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    fetchAssignments();
  }

  function clearFilters() {
    setQ('');
    setLabId('');
    setStatus('');
    fetchAssignments();
  }

  function loadMore() {
    if (pageInfo.hasNextPage && pageInfo.nextCursor) {
      fetchAssignments({ append: true, cursor: pageInfo.nextCursor });
    }
  }

  async function updateStatus(id, newStatus) {
    setSavingRow(id);
    try {
      await api.patch(`/lab-assignments/${id}`, { status: newStatus });
      setItems(prev => prev.map(it => (it.id === id ? { ...it, status: newStatus } : it)));
    } catch (e) {
      console.error('Erro ao atualizar status', e);
      alert('Não foi possível atualizar o status.');
    } finally {
      setSavingRow(null);
    }
  }

  return (
    <Layout>
      <div className="la-header">
        <h2 className="la-title">Designações de Laboratório</h2>
        <Link to="/labs/assignments/new" className="btn-primary">+ Nova designação</Link>
      </div>

      <form className="la-filters" onSubmit={handleFilter}>
        <input
          className="input"
          type="text"
          placeholder="Buscar por ID / TestOrder / Lab…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="lab-select">
          <AsyncSelect
            value={labId}
            onChange={(val) => setLabId(val || '')}
            fetchOptions={searchLabs}
            placeholder="Filtrar por laboratório…"
          />
        </div>

        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button className="btn-filter" type="submit" disabled={loading}>
          {loading ? 'Filtrando…' : 'Filtrar'}
        </button>
      </form>

      <div className="la-table">
        <div className="la-thead">
          <div>Ordem</div>
          <div>Laboratório</div>
          <div>Designado em</div>
          <div>Status</div>
          <div></div>
        </div>

        {items.map((a) => (
          <div key={a.id} className="la-row">
            <div className="cell mono">{a.testOrderId ? a.testOrderId.slice(0,8) + '…' : '—'}</div>
            <div className="cell">{a.lab?.name || (a.labId ? a.labId.slice(0,8) + '…' : '—')}</div>
            <div className="cell">
              {a.assignedAt ? new Date(a.assignedAt).toLocaleString() : '—'}
            </div>
            <div className={`cell status ${a.status?.toLowerCase()}`}>{a.status}</div>
            <div className="cell actions">
              <select
                className="select"
                value={a.status}
                onChange={(e) => updateStatus(a.id, e.target.value)}
                disabled={savingRow === a.id}
                title="Alterar status"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* novo: cria resultado pré-preenchendo labId e testOrderId via querystring */}
              <Link
                className="btn-small"
                to={`/results/new?labId=${encodeURIComponent(a.labId)}&testOrderId=${encodeURIComponent(a.testOrderId)}`}
                title="Criar resultado para esta designação"
                style={{ marginLeft: 8 }}
              >
                Criar resultado
              </Link>
            </div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="la-empty">Nenhuma designação encontrada.</div>
        )}
      </div>

      {pageInfo.hasNextPage && (
        <button className="btn-load-more" onClick={loadMore} disabled={loading}>
          {loading ? 'Carregando…' : 'Carregar mais'}
        </button>
      )}
    </Layout>
  );
}
