import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../api/api';
import AsyncSelect from '../components/AsyncSelect';
import { searchTestOrders, searchUsers } from '../api/lookups';
import './SampleCreate.css';

const TYPES = ['URINE', 'BLOOD'];
const STATUS = ['SEALED', 'SHIPPED', 'RECEIVED', 'ANALYZING', 'ARCHIVED'];

function generateSampleCode(type = 'URINE') {
  const date = new Date();
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  // Ex.: CBF-UR-2025-11-16-8F3A
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CBF-${type === 'BLOOD' ? 'BL' : 'UR'}-${y}-${m}-${d}-${rnd}`;
}

export default function SampleCreate() {
  const navigate = useNavigate();

  // formulário
  const [testOrderId, setTestOrderId] = useState('');
  const [code, setCode] = useState(generateSampleCode('URINE'));
  const [type, setType] = useState('URINE');
  const [status, setStatus] = useState('SEALED');
  const [collectedAt, setCollectedAt] = useState('');
  const [collectedByUserId, setCollectedByUserId] = useState('');

  // cadeia de custódia (UX simples)
  const [sealA, setSealA] = useState('');
  const [sealB, setSealB] = useState('');
  const [transfers, setTransfers] = useState([
    { timestamp: '', from: '', to: '', notes: '' },
  ]);

  useEffect(() => {
    // quando muda o tipo, atualiza o prefixo do código (mantendo sufixo)
    setCode(generateSampleCode(type));
  }, [type]);

  const custodyJson = useMemo(() => {
    const cleaned = transfers
      .filter(t => t.timestamp && (t.from || t.to || t.notes))
      .map(t => ({
        timestamp: t.timestamp,
        from: t.from?.trim() || undefined,
        to: t.to?.trim() || undefined,
        notes: t.notes?.trim() || undefined,
      }));
    return {
      seals: {
        containerA: sealA || undefined,
        containerB: sealB || undefined,
      },
      transfers: cleaned,
    };
  }, [sealA, sealB, transfers]);

  function updateTransfer(idx, key, val) {
    setTransfers(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  }

  function addTransfer() {
    setTransfers(prev => [...prev, { timestamp: '', from: '', to: '', notes: '' }]);
  }

  function removeTransfer(idx) {
    setTransfers(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!testOrderId) {
      alert('Selecione uma Ordem de Teste.');
      return;
    }
    if (!code.trim()) {
      alert('Informe um código para a amostra.');
      return;
    }

    try {
      const payload = {
        testOrderId,
        code: code.trim(),
        type,
        status,
        collectedAt: collectedAt || undefined,
        collectedByUserId: collectedByUserId || undefined,
        chainOfCustodyJson: custodyJson,
      };

      await api.post('/samples', payload);
      alert('Amostra criada com sucesso!');
      navigate('/samples');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar amostra.');
    }
  }

  return (
    <Layout>
      <div className="sc-header">
        <h2 className="sc-title">Nova amostra</h2>
      </div>

      <form className="sc-form" onSubmit={handleSubmit}>
        <div className="row">
          <label>Ordem de Teste</label>
          <AsyncSelect
            value={testOrderId}
            onChange={(val) => setTestOrderId(val || '')}
            fetchOptions={searchTestOrders}
            placeholder="Buscar ordens…"
          />
        </div>

        <div className="row two">
          <div>
            <label>Tipo</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="row with-btn">
          <div>
            <label>Código da Amostra</label>
            <input
              className="input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex.: CBF-UR-2025-11-16-8F3A"
            />
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setCode(generateSampleCode(type))}
            title="Gerar automaticamente"
          >
            Regenerar
          </button>
        </div>

        <div className="row two">
          <div>
            <label>Coletada em</label>
            <input
              className="input"
              type="datetime-local"
              value={collectedAt}
              onChange={(e) => setCollectedAt(e.target.value)}
            />
          </div>
          <div>
            <label>Coletada por (User)</label>
            <AsyncSelect
              value={collectedByUserId}
              onChange={(val) => setCollectedByUserId(val || '')}
              fetchOptions={searchUsers}
              placeholder="Buscar usuário…"
            />
          </div>
        </div>

        <details className="custody">
          <summary>Cadeia de Custódia (opcional)</summary>

          <div className="row two">
            <div>
              <label>Lacre A</label>
              <input
                className="input"
                type="text"
                value={sealA}
                onChange={(e) => setSealA(e.target.value)}
                placeholder="Ex.: A-123456"
              />
            </div>
            <div>
              <label>Lacre B</label>
              <input
                className="input"
                type="text"
                value={sealB}
                onChange={(e) => setSealB(e.target.value)}
                placeholder="Ex.: B-654321"
              />
            </div>
          </div>

          <div className="row">
            <label>Transferências</label>
            <div className="transfer-list">
              {transfers.map((t, idx) => (
                <div className="transfer-row" key={idx}>
                  <input
                    className="input"
                    type="datetime-local"
                    value={t.timestamp}
                    onChange={(e) => updateTransfer(idx, 'timestamp', e.target.value)}
                    title="Data/hora"
                  />
                  <input
                    className="input"
                    type="text"
                    value={t.from}
                    onChange={(e) => updateTransfer(idx, 'from', e.target.value)}
                    placeholder="De (nome/cargo)"
                  />
                  <input
                    className="input"
                    type="text"
                    value={t.to}
                    onChange={(e) => updateTransfer(idx, 'to', e.target.value)}
                    placeholder="Para (nome/cargo)"
                  />
                  <input
                    className="input"
                    type="text"
                    value={t.notes}
                    onChange={(e) => updateTransfer(idx, 'notes', e.target.value)}
                    placeholder="Observações"
                  />
                  <button
                    type="button"
                    className="btn-ghost danger"
                    onClick={() => removeTransfer(idx)}
                    title="Remover"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className="transfer-actions">
              <button type="button" className="btn-ghost" onClick={addTransfer}>
                + Adicionar transferência
              </button>
            </div>
          </div>

          <div className="row">
            <label>Pré-visualização do JSON</label>
            <pre className="json-preview">
{JSON.stringify(custodyJson, null, 2)}
            </pre>
          </div>
        </details>

        <div className="form-actions">
          <button className="btn-primary" type="submit">Criar amostra</button>
        </div>
      </form>
    </Layout>
  );
}
