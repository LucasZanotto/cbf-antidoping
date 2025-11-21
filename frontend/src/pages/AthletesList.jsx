// src/pages/AthletesList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Layout } from '../components/Layout';
import './AthletesList.css';

export default function AthletesList() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, nextCursor: null });
  const [loading, setLoading] = useState(false);

  async function fetchAthletes({ append = false, cursor = null } = {}) {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (q) params.q = q;
      if (status) params.status = status;
      if (cursor) params.cursor = cursor;

      const { data } = await api.get('/athletes', { params });
      const newItems = data.items || [];
      setItems((prev) => (append ? [...prev, ...newItems] : newItems));
      setPageInfo(data.pageInfo || { hasNextPage: false, nextCursor: null });
    } catch (err) {
      console.error('Erro ao carregar atletas', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAthletes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchAthletes();
  }

  function loadMore() {
    if (pageInfo.hasNextPage && pageInfo.nextCursor) {
      fetchAthletes({ append: true, cursor: pageInfo.nextCursor });
    }
  }

  return (
    <Layout>
      <div className="athletes-header">
        <h2 className="athletes-title">Atletas</h2>
        <Link to="/athletes/new" className="btn-primary">+ Novo atleta</Link>
      </div>

      <form className="athletes-filters" onSubmit={handleSearch}>
        <input
          className="input"
          type="text"
          placeholder="Buscar por nome ou código CBF"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos status</option>
          <option value="ELIGIBLE">Elegível</option>
          <option value="SUSPENDED">Suspenso</option>
          <option value="INACTIVE">Inativo</option>
        </select>
        <button className="btn-filter" type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="athletes-table">
        <div className="athletes-thead">
          <div>Nome</div>
          <div>Código CBF</div>
          <div>Nascimento</div>
          <div>Status</div>
        </div>

        {items.map((a) => (
          <div key={a.id} className="athletes-row">
            <div className="cell">{a.fullName}</div>
            <div className="cell mono">{a.cbfCode}</div>
            <div className="cell">{new Date(a.birthDate).toLocaleDateString()}</div>
            <div className={`cell status ${a.status?.toLowerCase()}`}>{a.status}</div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="athletes-empty">Nenhum atleta encontrado.</div>
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
