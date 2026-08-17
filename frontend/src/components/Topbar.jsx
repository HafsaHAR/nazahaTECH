import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageDropdown from './LanguageDropdown';
import './Topbar.css';

export default function Topbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName && user.firstName !== 'undefined') {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.name && user.name !== 'undefined undefined') {
      return user.name;
    }
    return user?.email || t('topbar.member');
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName && user.firstName !== 'undefined') {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name && user.name !== 'undefined undefined') {
      const parts = user.name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'IN';
  };

  return (
    <header className="topbar">
      {/* Barre d'outils droite : Sélecteur de Langue Popover, Thème, Cloche & Utilisateur */}
      <div className="topbar-right">
        <div className="topbar-controls-group">
          {/* Popover Menu Sélecteur de Langue (FR / EN / AR) */}
          <LanguageDropdown />

          {/* Bouton d'alternance Thème Sombre / Clair (Icon Button) */}
          <button
            onClick={toggleTheme}
            className="theme-icon-toggle"
            title={theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Notification Bell */}
        {user && (
          <button className="topbar-bell-btn" title="Notifications">
            🔔
          </button>
        )}

        {/* Profil utilisateur ou Connexion Visiteur */}
        {user ? (
          <div className="topbar-user-pill">
            <div className="user-info-text">
              <span className="user-full-name">{getDisplayName()}</span>
              <span className="user-sub-role">
                {user?.role === 'admin' ? t('topbar.admin') : t('topbar.member')}
              </span>
            </div>
            <div className="user-avatar-circle">
              {getInitials()}
            </div>
          </div>
        ) : (
          <div className="topbar-user-pill">
            <div className="user-info-text">
              <span className="user-full-name" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                {t('topbar.guest')}
              </span>
            </div>
            <Link to="/login" className="btn-topbar-login">
              {t('nav.login')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
