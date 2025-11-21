// src/pages/ResultsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { Layout } from "../components/Layout";
import "./ResultsList.css";
import { downloadResultPdf } from "../api/files";

const OUTCOMES = ["NEGATIVE", "AAF", "INCONCLUSIVE"];
const FINAL_STATUSES = ["CONFIRMED", "UNDER_APPEAL", "RETRACTED"];

export default function ResultsList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");              // busca por sample code/id
  const [outcome, setOutcome] = useState("");
  const [finalStatus, setFinalStatus] = useState("");
  const [labId, setLabId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, nextCursor: null });

  async function fetchResults({ append = false, cursor = null } = {}) {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (q) params.q = q;
      if (outcome) params.outcome = outcome;
      if (finalStatus) params.finalStatus = finalStatus;
      if (labId) params.labId = labId;
      if (cursor) params.cursor = cursor;

      const { data } = await api.get("/test-results", { params });
      const rows = data.items || data || [];
      setItems((prev) => (append ? [...prev, ...rows] : rows));
      setPageInfo(data.pageInfo || { hasNextPage: false, nextCursor: null });
    } catch (err) {
      console.error("Erro ao carregar resultados", err);
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

  function clearFilters() {
    setQ("");
    setOutcome("");
    setFinalStatus("");
    setLabId("");
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
        <h2 className="results-title">Resultados</h2>
        <Link to="/results/new" className="btn-primary">+ Novo resultado</Link>
      </div>

      <form className="results-filters" onSubmit={handleFilter}>
        <input
          className="input"
          type="text"
          placeholder="Buscar por ID/código de amostra"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="select"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        >
          <option value="">Todos Outcomes</option>
          {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <select
          className="select"
          value={finalStatus}
          onChange={(e) => setFinalStatus(e.target.value)}
        >
          <option value="">Todos status finais</option>
          {FINAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          className="input"
          type="text"
          placeholder="Filtrar por Lab ID (opcional)"
          value={labId}
          onChange={(e) => setLabId(e.target.value)}
        />

        <button className="btn-filter" type="submit" disabled={loading}>
          {loading ? "Filtrando..." : "Filtrar"}
        </button>
        <button
          type="button"
          className="btn-filter"
          onClick={clearFilters}
          disabled={loading}
          style={{ marginLeft: 8 }}
        >
          Limpar
        </button>
      </form>

      <div className="results-table">
        <div className="results-thead">
          <div>Laudo em</div>
          <div>Outcome</div>
          <div>Status Final</div>
          <div>Lab</div>
          <div>Amostra</div>
          <div>Ordem</div>
          <div>Ações</div>
        </div>

        {items.map((r) => (
          <div key={r.id} className="results-row">
            <div className="cell">
              {r.reportedAt ? new Date(r.reportedAt).toLocaleString() : "—"}
            </div>
            <div className={`cell outcome ${String(r.outcome || "").toLowerCase()}`}>
              {r.outcome || "—"}
            </div>
            <div className="cell">{r.finalStatus || "—"}</div>
            <div className="cell">
              {r.lab?.name ? `${r.lab.name}` : (r.labId || "—")}
            </div>
            <div className="cell mono">
              {r.sample?.code ? r.sample.code : (r.sampleId ? r.sampleId.slice(0,8)+"..." : "—")}
            </div>
            <div className="cell mono">
              {r.sample?.testOrderId
                ? r.sample.testOrderId.slice(0,8)+"..."
                : (r.testOrderId ? r.testOrderId.slice(0,8)+"..." : "—")}
            </div>
            <div className="cell actions">
              <Link className="btn-small" to={`/results/${r.id}`}>Ver</Link>
              {r.pdfReportUrl ? (
                <a
                  className="btn-small"
                  href={r.pdfReportUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 8 }}
                >
                  Ver PDF
                </a>
              ) : null}
              <button
                type="button"
                className="btn-small"
                style={{ marginLeft: 8 }}
                onClick={() => downloadResultPdf(r.id)}
                title="Gerar e baixar PDF do sistema"
              >
                Baixar PDF
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="results-empty">Nenhum resultado encontrado.</div>
        )}
      </div>

      {pageInfo.hasNextPage && (
        <button className="btn-load-more" onClick={loadMore} disabled={loading}>
          {loading ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </Layout>
  );
}
