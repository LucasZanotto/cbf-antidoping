import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import AsyncSelect from '../components/AsyncSelect';
import { searchLabs, searchTestOrders } from '../api/lookups';
import api from '../api/api';
import './LabAssignmentCreate.css';

const STATUSES = [
  'AWAITING_PICKUP',
  'IN_TRANSIT',
  'RECEIVED',
  'PROCESSING',
  'DONE',
];

export default function LabAssignmentCreate() {
  const navigate = useNavigate();

  const [testOrderId, setTestOrderId] = useState('');
  const [labId, setLabId] = useState('');
  const [status, setStatus] = useState('AWAITING_PICKUP');
  const [assignedAt, setAssignedAt] = useState(() => {
    // yyyy-mm-ddThh:mm local
    const d = new Date();
    d.setSeconds(0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  });

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!testOrderId || !labId) {
      alert('Selecione a Ordem e o Laboratório.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/lab-assignments', {
        testOrderId,
        labId,
        status,
        assignedAt: assignedAt ? new Date(assignedAt).toISOString() : undefined,
      });
      alert('Designação criada com sucesso.');
      navigate('/labs/assignments');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar designação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="lac-header">
        <h2 className="lac-title">Nova designação de laboratório</h2>
      </div>

      <form className="lac-form" onSubmit={handleSubmit}>
        <div className="row">
          <label>Ordem de Teste</label>
          <AsyncSelect
            value={testOrderId}
            onChange={(val) => setTestOrderId(val || '')}
            fetchOptions={searchTestOrders}
            placeholder="Buscar ordem por ID/atleta/clube…"
          />
        </div>

        <div className="row">
          <label>Laboratório</label>
          <AsyncSelect
            value={labId}
            onChange={(val) => setLabId(val || '')}
            fetchOptions={searchLabs}
            placeholder="Buscar laboratório por nome/código…"
          />
        </div>

        <div className="row two">
          <div>
            <label>Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Designado em</label>
            <input
              className="input"
              type="datetime-local"
              value={assignedAt}
              onChange={(e) => setAssignedAt(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Criar designação'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
