import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/inpplc-logo.png';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Logo & Brand */}
        <NavLink to="/" className="sidebar-brand">
          <div className="sidebar-logo-badge">
            <img src={logo} alt="INPPLC Logo" />
          </div>
          <div>
            <div className="sidebar-brand-title">INPPLC</div>
            <div className="sidebar-brand-sub">Innovation Hub</div>
          </div>
        </NavLink>

        {/* Bouton + Nouvelle idée */}
        <NavLink
          to={user ? "/submit-idea" : "/login"}
          className="btn-new-idea"
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⊕</span> {t('nav.new_idea')}
        </NavLink>

        {/* Liens de navigation principaux */}
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⊞</span> {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/ideas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">💡</span> {t('nav.ideas')}
          </NavLink>
          <NavLink to="/challenges" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🏆</span> {t('nav.challenges')}
          </NavLink>
          {user && (
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">👤</span> {t('nav.profile')}
            </NavLink>
          )}
        </nav>
      </div>

      {/* Bouton du Bas (Déconnexion ou Connexion) */}
      <div className="sidebar-bottom">
        {user ? (
          <button onClick={handleLogout} className="btn-sidebar-logout">
            <span>➔</span> {t('nav.logout')}
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="btn-sidebar-logout" style={{ color: 'var(--primary-gold)' }}>
            <span>➔</span> {t('nav.login')}
          </button>
        )}
      </div>
    </aside>
  );
}
