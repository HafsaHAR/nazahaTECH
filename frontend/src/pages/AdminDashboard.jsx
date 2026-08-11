import { useState, useEffect } from 'react';
import {
  getAdminMetricsApi,
  getAdminNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  approveIdeaApi,
  rejectIdeaApi,
  approveParticipationApi,
  rejectParticipationApi
} from '../api/adminApi';
import { getIdeasApi } from '../api/ideaApi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ideas'); // 'ideas' | 'participations' | 'notifications'
  const [metrics, setMetrics] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [metricsData, ideasData, notifsData] = await Promise.all([
        getAdminMetricsApi(),
        getIdeasApi(),
        getAdminNotificationsApi()
      ]);

      setMetrics(metricsData);
      setIdeas(ideasData.ideas || []);
      setNotifications(notifsData.notifications || []);
      setUnreadCount(notifsData.unreadCount || 0);

    } catch (err) {
      console.error('Erreur chargement données Admin :', err);
      setError('Impossible de charger les données administrateur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveIdea = async (id) => {
    try {
      await approveIdeaApi(id);
      loadAdminData();
    } catch (err) {
      console.error('Erreur approbation idée :', err);
    }
  };

  const handleRejectIdea = async (id) => {
    try {
      await rejectIdeaApi(id);
      loadAdminData();
    } catch (err) {
      console.error('Erreur rejet idée :', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur notification read :', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur tout marquer lu :', err);
    }
  };

  const getAuthorName = (author) => {
    if (!author) return 'Auteur inconnu';
    if (typeof author === 'object') {
      if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
      if (author.name) return author.name;
    }
    return 'Auteur inconnu';
  };

  const pendingIdeas = ideas.filter((i) => i.status === 'pending');

  return (
    <div className="admin-dashboard">
      {/* En-tête Espace Admin */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">
            <span>🛡️</span> Espace Modération & Administration
          </h1>
          <p className="admin-sub">
            Supervisez les soumissions citoyennes, contrôlez la modération et consultez les notifications.
          </p>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Cartes Métriques Agrégées MongoDB */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card pending">
          <div className="metric-header">
            <span>En attente de modération</span>
            <span>⏳</span>
          </div>
          <div className="metric-number">{metrics?.statusCounts?.pending || pendingIdeas.length}</div>
        </div>

        <div className="admin-metric-card approved">
          <div className="metric-header">
            <span>Idées approuvées</span>
            <span>✅</span>
          </div>
          <div className="metric-number">{metrics?.statusCounts?.approved || 0}</div>
        </div>

        <div className="admin-metric-card rejected">
          <div className="metric-header">
            <span>Idées rejetées</span>
            <span>🚫</span>
          </div>
          <div className="metric-number">{metrics?.statusCounts?.rejected || 0}</div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span>Soumissions (24h)</span>
            <span>✨</span>
          </div>
          <div className="metric-number">{metrics?.newIdeas24h || 0}</div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          Idées à modérer ({pendingIdeas.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'all_ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('all_ideas')}
        >
          Toutes les idées ({ideas.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications Admin {unreadCount > 0 && <span style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', marginLeft: '0.35rem' }}>{unreadCount}</span>}
        </button>
      </div>

      {/* Onglet 1 : Modération des Idées en attente */}
      {activeTab === 'ideas' && (
        <div>
          {pendingIdeas.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3>Aucune idée en attente de modération</h3>
              <p>Toutes les propositions citoyennes ont été traitées !</p>
            </div>
          ) : (
            pendingIdeas.map((idea) => (
              <div key={idea._id} className="moderation-card">
                <div className="moderation-body">
                  <span className="moderation-badge pending">En attente</span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                    Catégorie: <strong>{idea.category}</strong>
                  </span>
                  <h3 className="moderation-title">{idea.title}</h3>
                  <p className="moderation-desc">{idea.description}</p>
                  <div className="moderation-meta">
                    <span>Par: <strong>{getAuthorName(idea.author)}</strong></span>
                    <span>Date: {new Date(idea.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="moderation-actions">
                  <button onClick={() => handleApproveIdea(idea._id)} className="btn-approve">
                    ✓ Approuver
                  </button>
                  <button onClick={() => handleRejectIdea(idea._id)} className="btn-reject">
                    ✕ Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Onglet 2 : Liste globale de toutes les idées */}
      {activeTab === 'all_ideas' && (
        <div>
          {ideas.map((idea) => (
            <div key={idea._id} className="moderation-card">
              <div className="moderation-body">
                <span className={`moderation-badge ${idea.status || 'pending'}`}>
                  {idea.status === 'approved' ? 'Publiée' : idea.status === 'rejected' ? 'Rejetée' : 'En attente'}
                </span>
                <h3 className="moderation-title">{idea.title}</h3>
                <p className="moderation-desc">{idea.description}</p>
                <div className="moderation-meta">
                  <span>Par: <strong>{getAuthorName(idea.author)}</strong></span>
                  <span>Votes: {idea.voteCount || 0}</span>
                </div>
              </div>

              {idea.status === 'pending' && (
                <div className="moderation-actions">
                  <button onClick={() => handleApproveIdea(idea._id)} className="btn-approve">
                    ✓ Approuver
                  </button>
                  <button onClick={() => handleRejectIdea(idea._id)} className="btn-reject">
                    ✕ Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Onglet 3 : Notifications Administrateur */}
      {activeTab === 'notifications' && (
        <div className="notifications-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Notifications Admin ({unreadCount} non lues)</h2>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn-cancel" style={{ fontSize: '0.85rem' }}>
                Tout marquer comme lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ color: '#6b7280', padding: '1rem 0' }}>Aucune notification pour le moment.</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif._id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                <div>
                  {!notif.isRead && <span className="unread-dot" />}
                  <span>{notif.message}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.75rem' }}>
                    {new Date(notif.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {!notif.isRead && (
                  <button onClick={() => handleMarkRead(notif._id)} className="btn-cancel" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                    Marquer lu
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
