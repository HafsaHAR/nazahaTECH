import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import logo from '../assets/inpplc-logo.png';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="app-navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo-link" onClick={closeMenu}>
          <div className="navbar-logo-badge">
            <img src={logo} alt="INPPLC Logo" />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-title">INPPLC</span>
            <span className="navbar-sub">Innovation Hub</span>
          </div>
        </Link>
      </div>

      {/* Hamburger button — mobile only */}
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Desktop actions */}
      <div className="navbar-actions navbar-actions--desktop">
        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-greeting">
              Bonjour, <strong>{user?.name || 'Utilisateur'}</strong> 👋
            </span>
            <span className="user-role-badge">{user?.role}</span>
            <button onClick={logout} className="btn-logout">
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/explore" className="btn-nav-visitor">Visiteur</Link>
            <Link to="/login" className="btn-nav-login">Se connecter</Link>
            <Link to="/register" className="btn-nav-register">Créer un compte</Link>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <span className="mobile-user-name">{user?.name || 'Utilisateur'}</span>
                <span className="user-role-badge">{user?.role}</span>
              </div>
              <button onClick={() => { logout(); closeMenu(); }} className="mobile-menu-item mobile-menu-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/explore" className="mobile-menu-item" onClick={closeMenu}>Mode visiteur</Link>
              <Link to="/login" className="mobile-menu-item" onClick={closeMenu}>Se connecter</Link>
              <Link to="/register" className="mobile-menu-item mobile-menu-register" onClick={closeMenu}>Créer un compte</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
