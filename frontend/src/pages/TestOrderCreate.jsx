import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/api';
import { Layout } from '../components/Layout';
import LoadingButton from '../components/LoadingButton';
import { useToast } from '../components/toast/ToastProvider';
import AsyncSelect from '../components/AsyncSelect';

import { searchFederations, searchClubs, searchAthletes } from '../api/lookups';
import { collectErrors, hasErrors, required } from '../utils/validation';

import './TestOrderCreate.css';

export default function TestOrderCreate() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    federationId: '',
    clubId: '',
    athleteId: '',
    matchId: '',
    reason: 'IN_COMPETITION',
    priority: 'NORMAL',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // validações
    const errs = collectErrors({
      federationId: [{ test: () => required(form.federationId), message: 'Selecione uma federação.' }],
      reason:       [{ test: () => required(form.reason),       message: 'Motivo é obrigatório.' }],
      priority:     [{ test: () => required(form.priority),     message: 'Prioridade é obrigatória.' }],
    });
    if (hasErrors(errs)) {
      setError(Object.values(errs)[0]);
      return;
    }

    setSaving(true);
    try {
      const payload = {
  federationId: form.federationId,
  clubId: form.clubId || undefined,
  athleteId: form.athleteId || undefined,
  matchId: form.matchId?.trim() || undefined, // <- some se vazio
  reason: form.reason,
  priority: form.priority,
};

      await api.post('/test-orders', payload);
      toast.success('Ordem criada.');
      navigate('/test-orders');
    } catch (err) {
      console.error(err);
      const msg = err.userMessage || 'Erro ao criar ordem.';
      toast.error(msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="orderCreate-header">
        <h2 className="orderCreate-title">Nova Ordem de Teste</h2>
      </div>

      <form className="orderCreate-form" onSubmit={handleSubmit}>
        <div className="orderCreate-grid">
          <label className="orderCreate-label">
            Federação *
            <AsyncSelect
  value={form.federationId}
  onChange={(val) => setForm((p) => ({ ...p, federationId: val, clubId: '' }))}
  fetchOptions={searchFederations}
  placeholder="Pesquisar federação..."
/>
          </label>

          <label className="orderCreate-label">
            Clube
            <AsyncSelect
              value={form.clubId}
              onChange={(val) => setForm((p) => ({ ...p, clubId: val }))}
              fetchOptions={(q) => searchClubs(q, form.federationId)}
              placeholder="Pesquisar clube..."
            />
          </label>
        </div>

        <div className="orderCreate-grid">
          <label className="orderCreate-label">
            Atleta
            <AsyncSelect
              value={form.athleteId}
              onChange={(val) => setForm((p) => ({ ...p, athleteId: val }))}
              fetchOptions={searchAthletes}
              placeholder="Pesquisar atleta..."
            />
          </label>

          <label className="orderCreate-label">
            Partida (ID)
            <input
              className="orderCreate-input"
              name="matchId"
              value={form.matchId}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </label>
        </div>

        <div className="orderCreate-grid">
          <label className="orderCreate-label">
            Motivo *
            <select
              className="orderCreate-select"
              name="reason"
              value={form.reason}
              onChange={handleChange}
            >
              <option value="IN_COMPETITION">IN_COMPETITION</option>
              <option value="OUT_OF_COMPETITION">OUT_OF_COMPETITION</option>
              <option value="TARGETED">TARGETED</option>
              <option value="RANDOM">RANDOM</option>
            </select>
          </label>

          <label className="orderCreate-label">
            Prioridade *
            <select
              className="orderCreate-select"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </label>
        </div>

        {error && <div className="orderCreate-error">{error}</div>}

        <div className="orderCreate-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/test-orders')}
          >
            Cancelar
          </button>

          <LoadingButton type="submit" className="btn-primary" loading={saving}>
            Criar ordem
          </LoadingButton>
        </div>
      </form>
    </Layout>
  );
}
