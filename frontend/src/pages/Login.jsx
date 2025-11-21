// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingButton from '../components/LoadingButton';
import { useToast } from '../components/toast/ToastProvider';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('admin@cbf.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
  await login(email, password);
  toast.success('Bem-vindo!');
  navigate('/athletes');
} catch (err) {
  console.error(err);
  toast.error(err.userMessage || 'Credenciais inválidas.');
}
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">CBF Antidoping</h1>
        <p className="login-subtitle">Área restrita</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            E-mail
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="login-label">
            Senha
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <LoadingButton className="login-button btn-primary" type="submit" loading={loading}>
  Entrar
</LoadingButton>
        </form>
      </div>
    </div>
  );
}
