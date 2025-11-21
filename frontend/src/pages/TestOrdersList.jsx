// src/pages/TestOrdersList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Layout } from '../components/Layout';
import './TestOrdersList.css';

export default function TestOrdersList() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, nextCursor: null });

  async function fetchOrders({ append = false, cursor = null } = {}) {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (status) params.status = status;
      if (cursor) params.cursor = cursor;

      const { data } = await api.get('/test-orders', { params });
      const newItems = data.items || [];
      setItems((prev) => (append ? [...prev, ...newItems] : newItems));
      setPageInfo(data.pageInfo || { hasNextPage: false, nextCursor: null });
    } catch (err) {
      console.error('Erro ao carregar ordens', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    fetchOrders();
  }

  function loadMore() {
    if (pageInfo.hasNextPage && pageInfo.nextCursor) {
      fetchOrders({ append: true, cursor: pageInfo.nextCursor });
    }
  }

  return (
    <Layout>
      <div className="orders-header">
        <h2 className="orders-title">Ordens de Teste</h2>
        <Link to="/test-orders/new" className="btn-primary">
          + Nova ordem
        </Link>
      </div>

      <form className="orders-filters" onSubmit={handleFilter}>
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos status</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="COLLECTING">COLLECTING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="RECEIVED">RECEIVED</option>
          <option value="ANALYZING">ANALYZING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="VOID">VOID</option>
        </select>
        <button className="btn-filter" type="submit" disabled={loading}>
          {loading ? 'Filtrando...' : 'Filtrar'}
        </button>
      </form>

      <div className="orders-table">
        <div className="orders-thead">
          <div>ID</div>
          <div>Motivo</div>
          <div>Prioridade</div>
          <div>Status</div>
          <div>Criada em</div>
        </div>

        {items.map((o) => (
          <div key={o.id} className="orders-row">
            <div className="cell mono">{o.id.slice(0, 8)}...</div>
            <div className="cell">{o.reason}</div>
            <div className={`cell priority ${o.priority?.toLowerCase()}`}>{o.priority}</div>
            <div className={`cell status ${o.status?.toLowerCase()}`}>{o.status}</div>
            <div className="cell">{new Date(o.createdAt).toLocaleString()}</div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="orders-empty">Nenhuma ordem encontrada.</div>
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
