// src/pages/SamplesList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Layout } from '../components/Layout';
import './SamplesList.css';

export default function SamplesList() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState(''); // busca por code
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, nextCursor: null });

  async function fetchSamples({ append = false, cursor = null } = {}) {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (status) params.status = status;
      if (type) params.type = type;
      if (q) params.q = q;
      if (cursor) params.cursor = cursor;

      const { data } = await api.get('/samples', { params });
      const newItems = data.items || [];
      setItems((prev) => (append ? [...prev, ...newItems] : newItems));
      setPageInfo(data.pageInfo || { hasNextPage: false, nextCursor: null });
    } catch (err) {
      console.error('Erro ao carregar amostras', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    fetchSamples();
  }

  function loadMore() {
    if (pageInfo.hasNextPage && pageInfo.nextCursor) {
      fetchSamples({ append: true, cursor: pageInfo.nextCursor });
    }
  }

  return (
    <Layout>
      <div className="samples-header">
        <h2 className="samples-title">Amostras</h2>
        <Link to="/samples/new" className="btn-primary">+ Nova amostra</Link>
      </div>

      <form className="samples-filters" onSubmit={handleFilter}>
        <input
          className="input"
          type="text"
          placeholder="Buscar por código"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="URINE">URINE</option>
          <option value="BLOOD">BLOOD</option>
        </select>
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos status</option>
          <option value="SEALED">SEALED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="RECEIVED">RECEIVED</option>
          <option value="ANALYZING">ANALYZING</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <button className="btn-filter" type="submit" disabled={loading}>
          {loading ? 'Filtrando...' : 'Filtrar'}
        </button>
      </form>

      <div className="samples-table">
        <div className="samples-thead">
          <div>Código</div>
          <div>Tipo</div>
          <div>Status</div>
          <div>Coletada em</div>
          <div>Ordem</div>
        </div>

        {items.map((s) => (
          <div key={s.id} className="samples-row">
            <div className="cell mono">{s.code}</div>
            <div className="cell">{s.type}</div>
            <div className={`cell status ${s.status?.toLowerCase()}`}>{s.status}</div>
            <div className="cell">
              {s.collectedAt ? new Date(s.collectedAt).toLocaleString() : '—'}
            </div>
            <div className="cell mono">{s.testOrderId?.slice(0, 8)}...</div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="samples-empty">Nenhuma amostra encontrada.</div>
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
