import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { Layout } from "../components/Layout";
import "./resultView.css";

export default function ResultView() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/test-results/${id}`);
      setItem(data);
    } catch (err) {
      console.error("Erro ao carregar resultado", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const prettyJSON = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj ?? "");
    }
  };

  return (
    <Layout>
      <div className="rv-header">
        <h2 className="rv-title">Resultado #{id?.slice(0,8)}...</h2>
        <Link to="/results" className="btn-primary">Voltar</Link>
      </div>

      {loading && <div className="rv-loading">Carregando…</div>}
      {!loading && !item && <div className="rv-empty">Não encontrado.</div>}

      {item && (
        <div className="rv-card">
          <div className="row two">
            <div>
              <label>Outcome</label>
              <div className="value">{item.outcome || "—"}</div>
            </div>
            <div>
              <label>Status Final</label>
              <div className="value">{item.finalStatus || "—"}</div>
            </div>
          </div>

          <div className="row two">
            <div>
              <label>Laudo em</label>
              <div className="value">
                {item.reportedAt ? new Date(item.reportedAt).toLocaleString() : "—"}
              </div>
            </div>
            <div>
              <label>PDF do Laudo</label>
              <div className="value">
                {item.pdfReportUrl ? <a href={item.pdfReportUrl} target="_blank" rel="noreferrer">Abrir</a> : "—"}
              </div>
            </div>
          </div>

          <div className="row two">
            <div>
              <label>Laboratório</label>
              <div className="value">{item.lab?.name || item.labId || "—"}</div>
            </div>
            <div>
              <label>Amostra</label>
              <div className="value">{item.sample?.code || item.sampleId || "—"}</div>
            </div>
          </div>

          <div className="row">
            <label>Detalhes (JSON)</label>
            <pre className="json">{prettyJSON(item.detailsJson)}</pre>
          </div>
        </div>
      )}
    </Layout>
  );
}
