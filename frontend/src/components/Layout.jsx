// src/components/Layout.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">CBF Antidoping</div>

        <nav className="nav-links">
  <Link to="/athletes" className="nav-link">Atletas</Link>
  <Link to="/test-orders" className="nav-link">Ordens</Link>
  <Link to="/samples" className="nav-link">Amostras</Link>
  <Link to="/results" className="nav-link">Resultados</Link>
  <Link to="/labs/assignments" className="nav-link">Labs</Link>
</nav>

        <div className="user-area">
          {user && (
            <>
              <span className="user-chip">
                <span className="user-name">{user.name}</span>
                <span className="user-role">({user.role})</span>
              </span>
              <button className="btn-logout" onClick={handleLogout}>Sair</button>
            </>
          )}
        </div>
      </header>

      <main className="app-content">{children}</main>
    </div>
  );
}
