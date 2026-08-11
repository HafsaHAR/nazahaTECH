import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getIdeasApi, voteIdeaApi } from '../api/ideaApi';
import {
  getAdminMetricsApi,
  getAdminNotificationsApi,
  getRejectedHistoryApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  approveIdeaApi,
  rejectIdeaApi
} from '../api/adminApi';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // États généraux
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  // États spécifiques Admin
  const [adminTab, setAdminTab] = useState('pending_ideas'); // 'pending_ideas' | 'all_ideas' | 'history' | 'notifications'
  const [metrics, setMetrics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [rejectedHistory, setRejectedHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        const [metricsData, ideasData, notifsData, historyData] = await Promise.all([
          getAdminMetricsApi(),
          getIdeasApi(),
          getAdminNotificationsApi(),
          getRejectedHistoryApi()
        ]);
        setMetrics(metricsData);
        setIdeas(ideasData.ideas || []);
        setNotifications(notifsData.notifications || []);
        setRejectedHistory(historyData.history || []);
        setUnreadCount(notifsData.unreadCount || 0);
      } else {
        const ideasData = await getIdeasApi();
        setIdeas(ideasData.ideas || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données du Tableau de Bord :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleVoteOptimistic = async (e, ideaId) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    const originalIdeas = [...ideas];

    setIdeas((prev) =>
      prev.map((item) => {
        if (item._id === ideaId) {
          const hasVoted = item.voters?.includes(user?._id);
          const newVoteCount = hasVoted ? Math.max(0, (item.voteCount || 1) - 1) : (item.voteCount || 0) + 1;
          return { ...item, voteCount: newVoteCount };
        }
        return item;
      })
    );

    try {
      const response = await voteIdeaApi(ideaId);
      if (response && response.idea) {
        setIdeas((prev) =>
          prev.map((item) => (item._id === ideaId ? response.idea : item))
        );
      }
    } catch (err) {
      console.error('Erreur vote optimiste :', err);
      setIdeas(originalIdeas);
    }
  };

  const handleRejectIdea = async (id) => {
    try {
      await rejectIdeaApi(id);
      loadData();
    } catch (err) {
      console.error('Erreur rejet :', err);
    }
  };

  const handleApproveIdea = async (id) => {
    try {
      await approveIdeaApi(id);
      loadData();
    } catch (err) {
      console.error('Erreur approbation :', err);
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
      console.error('Erreur lecture notification :', err);
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
    if (!author) return 'Citoyen INPPLC';
    if (typeof author === 'object') {
      if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
      if (author.name) return author.name;
    }
    return 'Citoyen INPPLC';
  };

  const pendingIdeas = ideas.filter((i) => i.status === 'pending');
  const totalVotes = ideas.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Hero Banner Conforme aux Maquettes */}
      <div className="dashboard-hero">
        <div className="hero-badge">
          <span>✨</span> {t('dashboard.badge')}
        </div>
        <h1 className="dashboard-hero-title">
          {isAdmin ? 'Tableau de bord & Modération Admin' : t('dashboard.hero_title')}
        </h1>
        <p className="dashboard-hero-sub">
          {isAdmin
            ? 'Supervisez les soumissions citoyennes en temps réel et gérez la modération.'
            : t('dashboard.hero_sub')}
        </p>
        <div className="hero-buttons">
          <Link to={user ? "/submit-idea" : "/login"} className="btn-hero-primary">
            {t('action.submit_idea')}
          </Link>
          <Link to="/challenges" className="btn-hero-secondary">
            {t('action.participate')}
          </Link>
        </div>
      </div>

      {/* Cartes Métriques (Design Dashboard) */}
      <div className="metrics-grid">
        {isAdmin ? (
          <>
            <div className="metric-card pending">
              <div className="metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>⏳</div>
              <div className="metric-value">{metrics?.statusCounts?.pending ?? pendingIdeas.length}</div>
              <div className="metric-label">En attente de modération</div>
            </div>

            <div className="metric-card approved">
              <div className="metric-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' }}>✅</div>
              <div className="metric-value">{metrics?.statusCounts?.approved ?? ideas.filter(i => i.status === 'approved').length}</div>
              <div className="metric-label">Idées approuvées</div>
            </div>

            <div className="metric-card rejected">
              <div className="metric-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>🚫</div>
              <div className="metric-value">{metrics?.statusCounts?.rejected ?? rejectedHistory.length}</div>
              <div className="metric-label">Idées rejetées</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper">✨</div>
              <div className="metric-value">{metrics?.newIdeas24h ?? 0}</div>
              <div className="metric-label">Nouvelles soumissions (24h)</div>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card">
              <div className="metric-icon-wrapper">💡</div>
              <div className="metric-value">{ideas.length > 0 ? ideas.length : 6}</div>
              <div className="metric-label">{t('dashboard.stat_ideas')}</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper">🏆</div>
              <div className="metric-value">2</div>
              <div className="metric-label">{t('dashboard.stat_challenges')}</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper">👍</div>
              <div className="metric-value">{totalVotes > 0 ? totalVotes : 701}</div>
              <div className="metric-label">{t('dashboard.stat_votes')}</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper">✨</div>
              <div className="metric-value">24</div>
              <div className="metric-label">{t('dashboard.stat_contributions')}</div>
            </div>
          </>
        )}
      </div>

      {/* Module de Modération Admin sur le Tableau de bord */}
      {isAdmin && (
        <div className="admin-moderation-section">
          <div className="moderation-tabs">
            <button
              className={`tab-btn ${adminTab === 'pending_ideas' ? 'active' : ''}`}
              onClick={() => setAdminTab('pending_ideas')}
            >
              ⏳ Idées à modérer ({pendingIdeas.length})
            </button>
            <button
              className={`tab-btn ${adminTab === 'all_ideas' ? 'active' : ''}`}
              onClick={() => setAdminTab('all_ideas')}
            >
              💡 Idées publiées ({ideas.length})
            </button>
            <button
              className={`tab-btn ${adminTab === 'history' ? 'active' : ''}`}
              onClick={() => setAdminTab('history')}
            >
              📋 Historique des rejets ({rejectedHistory.length})
            </button>
            <button
              className={`tab-btn ${adminTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setAdminTab('notifications')}
            >
              🔔 Notifications {unreadCount > 0 && <span style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', marginLeft: '0.35rem' }}>{unreadCount}</span>}
            </button>
          </div>

          {/* Onglet 1: Idées en attente de modération */}
          {adminTab === 'pending_ideas' && (
            <div>
              {pendingIdeas.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                  <p>Aucune idée en attente de modération pour le moment.</p>
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
                        ✕ Rejeter & Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Onglet 2: Vue globale des idées publiées */}
          {adminTab === 'all_ideas' && (
            <div>
              {ideas.map((idea) => (
                <div key={idea._id} className="moderation-card">
                  <div className="moderation-body">
                    <span className={`moderation-badge ${idea.status || 'pending'}`}>
                      {idea.status === 'approved' ? 'Publiée' : 'En attente'}
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
                        ✕ Rejeter & Supprimer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Onglet 3: Historique des rejets */}
          {adminTab === 'history' && (
            <div>
              {rejectedHistory.length === 0 ? (
                <p style={{ color: '#6b7280', padding: '1rem 0' }}>Aucune idée enregistrée dans l'historique des rejets.</p>
              ) : (
                rejectedHistory.map((item) => (
                  <div key={item._id} className="moderation-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="moderation-body">
                      <span className="moderation-badge rejected">Supprimée & Archivée</span>
                      <h3 className="moderation-title">{item.title}</h3>
                      <p className="moderation-desc">{item.description}</p>
                      <div className="moderation-meta">
                        <span>Auteur originel: <strong>{getAuthorName(item.author)}</strong></span>
                        <span>Rejeté le: {new Date(item.rejectedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Onglet 4: Notifications Admin */}
          {adminTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notifications Admin ({unreadCount} non lues)</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="btn-cancel" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
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
                      <button onClick={() => handleMarkRead(notif._id)} className="btn-cancel" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                        Marquer lu
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Section Idées populaires */}
      <div className="trending-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {t('dashboard.trending_title')}
            </h2>
            <p className="section-subtitle">{t('dashboard.trending_sub')}</p>
          </div>
          <Link to="/ideas" className="see-all-link">
            {t('action.view_all')} →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', color: '#6b7280' }}>Chargement des idées...</div>
        ) : ideas.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', color: '#6b7280' }}>
            Aucune idée enregistrée pour le moment. Cliquez sur "Soumettre une idée" ci-dessus !
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.slice(0, 3).map((idea) => (
              <div
                key={idea._id}
                className="idea-card clickable-idea-card"
                onClick={() => navigate(`/ideas/${idea._id}`)}
                title="Cliquer pour consulter l'idée"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span className="idea-badge">{idea.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('fr-FR') : 'Récemment'}
                    </span>
                  </div>
                  <h3 className="idea-title">{idea.title}</h3>
                  <p className="idea-desc">{idea.description}</p>
                </div>

                <div className="idea-footer">
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Par <strong>{getAuthorName(idea.author)}</strong>
                  </span>
                  <button className="vote-btn" onClick={(e) => handleVoteOptimistic(e, idea._id)}>
                    👍 <span>{idea.voteCount || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
