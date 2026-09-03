import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageDropdown from './LanguageDropdown';
import { getAdminNotificationsApi } from '../api/adminApi';
import './Topbar.css';

export default function Topbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, translateText } = useLanguage();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { _id: '1', message: 'Nouvelle proposition citoyenne soumise pour modération.', createdAt: new Date(), isRead: false },
    { _id: '2', message: 'Défi "Digitalisation des Marchés Publics" mis à jour.', createdAt: new Date(Date.now() - 3600000), isRead: false },
    { _id: '3', message: 'Nouveau document publié dans la Bibliothèque.', createdAt: new Date(Date.now() - 86400000), isRead: true }
  ]);

  const notifRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      getAdminNotificationsApi()
        .then((res) => {
          if (res && Array.isArray(res.notifications) && res.notifications.length > 0) {
            setNotifications(res.notifications);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

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

          {/* Bouton d'alternance Thème Sombre / Clair */}
          <button
            onClick={toggleTheme}
            className="theme-icon-toggle"
            title={theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Notification Bell & Dropdown Drawer */}
        {user && (
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="topbar-bell-btn"
              title="Notifications"
              style={{ position: 'relative' }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>🔔 {translateText('Notifications')}</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ border: 'none', background: 'none', color: 'var(--primary-green)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {translateText('Tout marquer lu')}
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: notif.isRead ? '#ffffff' : '#f0fdf4',
                          fontSize: '0.825rem',
                          color: '#374151'
                        }}
                      >
                        <div style={{ fontWeight: notif.isRead ? 400 : 700, marginBottom: '0.2rem' }}>
                          {translateText(notif.message)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
