// src/pages/TestResultsList.jsx
import { useEffect, useState } from 'react';
import api from '../api/api';
import { Layout } from '../components/Layout';
import './TestResultsList.css';

export default function TestResultsList() {
  const [items, setItems] = useState([]);
  const [outcome, setOutcome] = useState('');
  const [finalStatus, setFinalStatus] = useState('');
  const [labId, setLabId] = useState('');
  const [q, setQ] = useState(''); // busca por código da amostra
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, nextCursor: null });

  async function fetchResults({ append = false, cursor = null } = {}) {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (q) params.q = q;                // backend: filtra por sample.code
      if (outcome) params.outcome = outcome;
      if (finalStatus) params.finalStatus = finalStatus;
      if (labId) params.labId = labId;
      if (cursor) params.cursor = cursor;

      const { data } = await api.get('/test-results', { params });
      const newItems = data.items || [];
      setItems((prev) => (append ? [...prev, ...newItems] : newItems));
      setPageInfo(data.pageInfo || { hasNextPage: false, nextCursor: null });
    } catch (err) {
      console.error('Erro ao carregar resultados', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    fetchResults();
  }

  function loadMore() {
    if (pageInfo.hasNextPage && pageInfo.nextCursor) {
      fetchResults({ append: true, cursor: pageInfo.nextCursor });
    }
  }

  return (
    <Layout>
      <div className="results-header">
        <h2 className="results-title">Resultados de Testes</h2>
      </div>

      <form className="results-filters" onSubmit={handleFilter}>
        <input
          className="input"
          type="text"
          placeholder="Buscar por código da amostra (ex.: CBF-UR-2025-0001)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="select"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        >
          <option value="">Todos os resultados</option>
          <option value="NEGATIVE">NEGATIVE</option>
          <option value="AAF">AAF</option>
          <option value="INCONCLUSIVE">INCONCLUSIVE</option>
        </select>
        <select
          className="select"
          value={finalStatus}
          onChange={(e) => setFinalStatus(e.target.value)}
        >
          <option value="">Todos os finais</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="UNDER_APPEAL">UNDER_APPEAL</option>
          <option value="RETRACTED">RETRACTED</option>
        </select>
        <input
          className="input"
          type="text"
          placeholder="Filtrar por Lab ID (opcional)"
          value={labId}
          onChange={(e) => setLabId(e.target.value)}
        />
        <button className="btn-filter" type="submit" disabled={loading}>
          {loading ? 'Filtrando...' : 'Filtrar'}
        </button>
      </form>

      <div className="results-table">
        <div className="results-thead">
          <div>Código da Amostra</div>
          <div>Laboratório</div>
          <div>Outcome</div>
          <div>Final</div>
          <div>Reportado em</div>
          <div>PDF</div>
        </div>

        {items.map((r) => (
          <div key={r.id} className="results-row">
            <div className="cell mono">{r.sample?.code || '—'}</div>
            <div className="cell mono">{r.labId?.slice(0, 8)}...</div>
            <div className={`cell outcome ${r.outcome?.toLowerCase()}`}>{r.outcome}</div>
            <div className={`cell final ${r.finalStatus ? r.finalStatus.toLowerCase() : 'none'}`}>
              {r.finalStatus || '—'}
            </div>
            <div className="cell">{new Date(r.reportedAt).toLocaleString()}</div>
            <div className="cell">
              {r.pdfReportUrl ? (
                <a className="link" href={r.pdfReportUrl} target="_blank" rel="noreferrer">
                  abrir
                </a>
              ) : (
                '—'
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="results-empty">Nenhum resultado encontrado.</div>
        )}
      </div>

      {pageInfo.hasNextPage && (
        <button className="btn-load-more" onClick={loadMore} disabled={loading}>
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </Layout>
  );
}
