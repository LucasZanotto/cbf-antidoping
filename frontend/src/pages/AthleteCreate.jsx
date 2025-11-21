// src/pages/AthleteCreate.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Layout } from '../components/Layout';
import LoadingButton from '../components/LoadingButton';
import { useToast } from '../components/toast/ToastProvider';
import { collectErrors, hasErrors, isCBFCode, isCPFDigits, required } from '../utils/validation';
import './AthleteCreate.css';

export default function AthleteCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cbfCode: '',
    fullName: '',
    birthDate: '',
    nationality: 'BRA',
    cpf: '',
    sex: 'M',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setError('');

  const errs = collectErrors({
    cbfCode: [
      { test: () => required(form.cbfCode), message: 'Código CBF é obrigatório.' },
      { test: () => isCBFCode(form.cbfCode), message: 'Código CBF inválido.' },
    ],
    fullName: [{ test: () => required(form.fullName), message: 'Nome é obrigatório.' }],
    birthDate: [{ test: () => required(form.birthDate), message: 'Data de nascimento é obrigatória.' }],
    cpf: [
      { test: () => required(form.cpf), message: 'CPF é obrigatório.' },
      { test: () => isCPFDigits(form.cpf), message: 'CPF deve ter 11 dígitos.' },
    ],
  });

  if (hasErrors(errs)) {
    setError(Object.values(errs)[0]);
    return;
  }

  setSaving(true);
  try {
    await api.post('/athletes', form);
    toast.success('Atleta criado com sucesso.');
    navigate('/athletes');
  } catch (err) {
    console.error(err);
    toast.error(err.userMessage || 'Erro ao criar atleta.');
    setError(err.userMessage || 'Erro ao cadastrar atleta.');
  } finally {
    setSaving(false);
  }
}

  return (
    <Layout>
      <div className="athleteCreate-header">
        <h2 className="athleteCreate-title">Novo Atleta</h2>
      </div>

      <form className="athleteCreate-form" onSubmit={handleSubmit}>
        <div className="athleteCreate-grid">
          <label className="athleteCreate-label">
            Código CBF *
            <input
              className="athleteCreate-input"
              name="cbfCode"
              value={form.cbfCode}
              onChange={handleChange}
              required
              placeholder="Ex.: 2025-000123"
            />
          </label>

          <label className="athleteCreate-label">
            Nome completo *
            <input
              className="athleteCreate-input"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Ex.: Lucas Abati Zanotto"
            />
          </label>
        </div>

        <div className="athleteCreate-grid">
          <label className="athleteCreate-label">
            Data de nascimento *
            <input
              className="athleteCreate-input"
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              required
            />
          </label>

          <label className="athleteCreate-label">
            Nacionalidade
            <input
              className="athleteCreate-input"
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              placeholder="Ex.: BRA"
            />
          </label>
        </div>

        <div className="athleteCreate-grid">
          <label className="athleteCreate-label">
            CPF (apenas números) *
            <input
              className="athleteCreate-input"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              required
              inputMode="numeric"
              placeholder="Ex.: 12345678901"
            />
          </label>

          <label className="athleteCreate-label">
            Sexo
            <select
              className="athleteCreate-select"
              name="sex"
              value={form.sex}
              onChange={handleChange}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro / Prefere não informar</option>
            </select>
          </label>
        </div>

        {error && <div className="athleteCreate-error">{error}</div>}

        <div className="athleteCreate-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/athletes')}
          >
            Cancelar
          </button>
          <LoadingButton type="submit" className="btn-primary" loading={saving}>
  Salvar atleta
</LoadingButton>

        </div>
      </form>
    </Layout>
  );
}
