import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  updateProfileApi,
  getActivitySummaryApi,
  getUserIdeasApi,
  getUserCommentsApi,
  getUserChallengesApi
} from '../api/authApi';
import { getUserChallengeSubmissionsApi } from '../api/challengeSubmissionApi';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, t, translateText } = useLanguage();

  // États pour la mise à jour des informations personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateError, setUpdateError] = useState('');

  // États du résumé d'activité
  const [summary, setSummary] = useState({
    ideasCount: 0,
    commentsCount: 0,
    challengesCount: 0,
    interactionsCount: 0
  });

  // Gestion des onglets d'activité
  const [activeTab, setActiveTab] = useState('ideas');
  const [tabData, setTabData] = useState([]);
  const [challengeSubmissions, setChallengeSubmissions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);

  // Synchronisation des informations utilisateur
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  // Chargement du résumé d'activité et des soumissions aux défis
  useEffect(() => {
    fetchSummary();
    fetchChallengeSubmissions();
  }, []);

  // Chargement dynamique des données de l'onglet actif
  useEffect(() => {
    if (activeTab !== 'challenge_submissions') {
      fetchTabData();
    }
  }, [activeTab, page]);

  const fetchSummary = async () => {
    try {
      const data = await getActivitySummaryApi();
      if (data && data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Erreur résumé d\'activité :', err);
    }
  };

  const fetchChallengeSubmissions = async () => {
    try {
      const data = await getUserChallengeSubmissionsApi();
      if (data && Array.isArray(data.submissions)) {
        setChallengeSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Erreur chargement soumissions aux défis :', err);
    }
  };

  const fetchTabData = async () => {
    try {
      setTabLoading(true);
      let res;
      if (activeTab === 'ideas') {
        res = await getUserIdeasApi({ page, limit: 10 });
      } else if (activeTab === 'comments') {
        res = await getUserCommentsApi({ page, limit: 10 });
      } else if (activeTab === 'challenges') {
        res = await getUserChallengesApi({ page, limit: 10 });
      }

      if (res) {
        const list = res.ideas || res.comments || res.challenges || res.submissions || res.data || [];
        setTabData(list);
        setHasMore(res.page < res.pages);
      }
    } catch (err) {
      console.error('Erreur onglet activité :', err);
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setUpdateMsg('');
    setUpdateError('');

    try {
      await updateProfileApi({ firstName, lastName, phoneNumber });
      setUpdateMsg('✅ Profil mis à jour avec succès !');
    } catch (err) {
      setUpdateError(err.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName && user.firstName !== 'undefined') {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.name && user.name !== 'undefined undefined') {
      return user.name;
    }
    if (user?.email) {
      const prefix = user.email.split('@')[0];
      return `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} INPPLC`;
    }
    return 'Membre Citoyen';
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName && user.firstName !== 'undefined') {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name && user.name !== 'undefined undefined') {
      const parts = user.name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'IN';
  };

  return (
    <div className="profile-container">
      {/* Carte d'En-tête */}
      <div className="profile-header-card">
        <div className="profile-main-info">
          <div className="profile-avatar-box">
            <div className="profile-avatar-large">
              {getInitials()}
            </div>
            <div>
              <h1 className="profile-name-title">{getDisplayName()}</h1>
              <div className="profile-email-sub">
                <span>📧 {user?.email}</span>
                <span>•</span>
                <span className="category-tag">
                  {user?.role === 'admin' ? `🛡️ ${t('profile.role_admin')}` : `👤 ${t('profile.role_user')}`}
                </span>
              </div>
            </div>
          </div>

          <button onClick={logout} className="btn-cancel" style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
            ➔ {t('nav.logout')}
          </button>
        </div>

        {/* Grille de Statistiques Légères */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <span className="stat-number">{summary.ideasCount}</span>
            <span className="stat-label">{t('profile.stat_ideas')}</span>
          </div>

          <div className="profile-stat-box">
            <span className="stat-number">{challengeSubmissions.length}</span>
            <span className="stat-label">{t('profile.stat_challenges')}</span>
          </div>

          <div className="profile-stat-box">
            <span className="stat-number">{summary.commentsCount}</span>
            <span className="stat-label">{t('profile.stat_comments')}</span>
          </div>

          <div className="profile-stat-box">
            <span className="stat-number">{summary.challengesCount}</span>
            <span className="stat-label">{t('profile.stat_bookmarks')}</span>
          </div>
        </div>
      </div>

      {/* Formulaire d'Édition du Profil */}
      <div className="profile-section-card">
        <h2 className="section-card-title">
          <span>⚙️</span> {t('profile.personal_info')}
        </h2>

        {updateMsg && <div className="alert-success" style={{ marginBottom: '1.25rem' }}>{updateMsg}</div>}
        {updateError && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{updateError}</div>}

        <form onSubmit={handleUpdateProfile} className="profile-form-grid">
          <div className="form-group-custom">
            <label>{t('register.first_name')}</label>
            <input
              type="text"
              placeholder="Votre prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input-lg"
            />
          </div>

          <div className="form-group-custom">
            <label>{t('register.last_name')}</label>
            <input
              type="text"
              placeholder="Votre nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input-lg"
            />
          </div>

          <div className="form-group-custom">
            <label>{t('register.phone')}</label>
            <input
              type="tel"
              placeholder="+212 6 00 00 00 00"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="form-input-lg"
            />
          </div>

          <div className="form-group-custom">
            <label>{t('profile.email_label')}</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="form-input-lg"
            />
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              disabled={updatingProfile}
              className="btn-hero-primary"
              style={{ padding: '0.75rem 1.75rem' }}
            >
              {updatingProfile ? '⏳ Enregistrement...' : `💾 ${t('action.save')}`}
            </button>
          </div>
        </form>
      </div>

      {/* Historique d'Activité */}
      <div className="profile-section-card">
        <h2 className="section-card-title">
          <span>📊</span> {t('profile.history_title')}
        </h2>

        {/* Onglets d'activité */}
        <div className="activity-tabs-header">
          <button
            className={`activity-tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ideas'); setPage(1); }}
          >
            {t('profile.tab_my_ideas')} ({summary.ideasCount})
          </button>
          <button
            className={`activity-tab-btn ${activeTab === 'challenge_submissions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('challenge_submissions'); setPage(1); }}
          >
            {t('profile.tab_my_challenges')} ({challengeSubmissions.length})
          </button>
          <button
            className={`activity-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('comments'); setPage(1); }}
          >
            {t('profile.tab_my_comments')} ({summary.commentsCount})
          </button>
          <button
            className={`activity-tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => { setActiveTab('challenges'); setPage(1); }}
          >
            {t('profile.tab_my_bookmarks')} ({summary.challengesCount})
          </button>
        </div>

        {/* Onglet Soumissions aux Défis (BDD ChallengeSubmission) */}
        {activeTab === 'challenge_submissions' ? (
          <div>
            {challengeSubmissions.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon">🎯</div>
                <h3>Vous n'avez soumis aucune proposition dans le cadre d'un défi</h3>
                <p>Découvrez les défis stratégiques de l'INPPLC et proposez vos solutions d'innovation !</p>
                <button onClick={() => navigate('/challenges')} className="btn-hero-primary" style={{ marginTop: '1rem' }}>
                  Voir les défis ouverts
                </button>
              </div>
            ) : (
              <div className="activity-items-list">
                {challengeSubmissions.map((sub) => (
                  <div key={sub._id} className="activity-item-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="category-tag" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                        🏆 Défi : {translateText(sub.challengeId?.title || 'Défi INPPLC')}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: sub.status === 'accepted' ? '#15803d' : sub.status === 'rejected' ? '#b91c1c' : '#b45309', backgroundColor: sub.status === 'accepted' ? '#dcfce7' : sub.status === 'rejected' ? '#fee2e2' : '#fef3c7', padding: '0.2rem 0.65rem', borderRadius: '6px' }}>
                        {sub.status === 'accepted' ? '🟢 Acceptée' : sub.status === 'rejected' ? '🔴 Rejetée' : '⏳ En modération'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
                      {sub.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {sub.description}
                    </p>

                    {Array.isArray(sub.attachments) && sub.attachments.length > 0 && (
                      <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {sub.attachments.map((att, aIdx) => (
                          <a key={aIdx} href={att.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.775rem', fontWeight: 700, backgroundColor: '#f3f4f6', color: '#111827', padding: '0.25rem 0.65rem', borderRadius: '6px', textDecoration: 'none' }}>
                            📎 {att.fileName} ({att.fileSize})
                          </a>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', color: '#9ca3af' }}>
                      <span>Déposé le {new Date(sub.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR')}</span>
                      <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>Soumission au Défi</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {tabLoading ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#6b7280' }}>
                Chargement de vos activités...
              </div>
            ) : tabData.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon">📊</div>
                <h3>Aucune activité trouvée dans cet onglet</h3>
                <p>Vos contributions apparaîtront ici au fur et à mesure de votre utilisation.</p>
              </div>
            ) : (
              <div className="activity-items-list">
                {tabData.map((item) => (
                  <div key={item._id} className="activity-item-card" onClick={() => item.title && navigate(activeTab === 'challenges' ? `/challenges/${item._id}` : `/ideas/${item._id || item.idea}`)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span className="category-tag" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.75rem' }}>
                        🏷️ {translateText(item.category || 'Général')}
                      </span>
                      {activeTab === 'ideas' && (
                        <span style={{ fontSize: '0.775rem', fontWeight: 700, color: item.status === 'approved' ? '#15803d' : '#b45309', backgroundColor: item.status === 'approved' ? '#dcfce7' : '#fef3c7', padding: '0.15rem 0.55rem', borderRadius: '6px' }}>
                          {item.status === 'approved' ? '🟢 Publiée' : '⏳ En modération'}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.35rem' }}>
                      {translateText(item.title || item.content || 'Contribution')}
                    </h4>
                    {item.description && <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '0.5rem' }}>{translateText(item.description)}</p>}

                    {Array.isArray(item.attachments) && item.attachments.length > 0 && (
                      <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {item.attachments.map((att, aIdx) => (
                          <span key={aIdx} style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f3f4f6', color: '#374151', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            📎 {att.fileName} ({att.fileSize})
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                      Soumise le {new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
