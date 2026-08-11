import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  updateProfileApi,
  getActivitySummaryApi,
  getUserIdeasApi,
  getUserCommentsApi,
  getUserChallengesApi,
  getUserInteractionsApi
} from '../api/authApi';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // États pour la mise à jour des informations personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateError, setUpdateError] = useState('');

  // États du résumé léger d'activité
  const [summary, setSummary] = useState({
    ideasCount: 0,
    commentsCount: 0,
    challengesCount: 0,
    interactionsCount: 0
  });

  // Gestion des onglets d'activité et du chargement à la demande (Lazy Loading)
  const [activeTab, setActiveTab] = useState('ideas'); // 'ideas' | 'comments' | 'challenges' | 'interactions'
  const [tabData, setTabData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tabLoading, setTabLoading] = useState(false);

  // Initialisation des champs d'édition lors du chargement de l'utilisateur
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  // Chargement initial du résumé d'activité léger (Counts)
  useEffect(() => {
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
    fetchSummary();
  }, []);

  // Chargement à la demande (Lazy Loading) des données de l'onglet actif et de la page
  useEffect(() => {
    fetchTabData(activeTab, page);
  }, [activeTab, page]);

  const fetchTabData = async (tab, currentPage) => {
    setTabLoading(true);
    try {
      if (tab === 'ideas') {
        const res = await getUserIdeasApi({ page: currentPage, limit: 5 });
        setTabData(res.ideas || []);
        setTotalPages(res.pages || 1);
      } else if (tab === 'comments') {
        const res = await getUserCommentsApi({ page: currentPage, limit: 5 });
        setTabData(res.comments || []);
        setTotalPages(res.pages || 1);
      } else if (tab === 'challenges') {
        const res = await getUserChallengesApi({ page: currentPage, limit: 5 });
        setTabData(res.challenges || []);
        setTotalPages(res.pages || 1);
      } else if (tab === 'interactions') {
        const res = await getUserInteractionsApi({ page: currentPage, limit: 5 });
        setTabData(res.interactions || []);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      console.error('Erreur chargement onglet :', err);
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  // Traitement de la mise à jour des informations personnelles
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setUpdateMsg('');
    setUpdateError('');

    try {
      await updateProfileApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim()
      });
      setUpdateMsg('Profil mis à jour avec succès !');
      // Mettre à jour l'affichage localement sans rechargement
      if (user) {
        user.firstName = firstName.trim();
        user.lastName = lastName.trim();
        user.name = `${firstName.trim()} ${lastName.trim()}`;
        user.phoneNumber = phoneNumber.trim();
      }
    } catch (err) {
      console.error('Erreur mise à jour profil :', err);
      setUpdateError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Fallback intelligent pour afficher un nom propre sans "undefined undefined"
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
      {/* 1. Carte d'En-tête de Profil avec Avatar & Statistiques Résumées */}
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
                  {user?.role === 'admin' ? '🛡️ Administrateur INPPLC' : '👤 Membre Citoyen'}
                </span>
              </div>
            </div>
          </div>

          <button onClick={logout} className="btn-cancel" style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
            ➔ Déconnexion
          </button>
        </div>

        {/* Grille des statistiques d'activité rapides */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <div className="profile-stat-val">{summary.ideasCount}</div>
            <div className="profile-stat-lbl">Idées Soumises</div>
          </div>

          <div className="profile-stat-box">
            <div className="profile-stat-val">{summary.commentsCount}</div>
            <div className="profile-stat-lbl">Commentaires</div>
          </div>

          <div className="profile-stat-box">
            <div className="profile-stat-val">{summary.challengesCount}</div>
            <div className="profile-stat-lbl">Défis & Favoris</div>
          </div>

          <div className="profile-stat-box">
            <div className="profile-stat-val">{summary.interactionsCount}</div>
            <div className="profile-stat-lbl">Interactions</div>
          </div>
        </div>
      </div>

      {/* 2. Section des Informations Personnelles Éditables */}
      <div className="profile-section-card">
        <h2 className="section-card-title">
          <span>📝</span> Mes Informations Personnelles
        </h2>

        {updateMsg && <div className="alert-success" style={{ marginBottom: '1rem' }}>{updateMsg}</div>}
        {updateError && <div className="alert-error" style={{ marginBottom: '1rem' }}>{updateError}</div>}

        <form onSubmit={handleUpdateProfile}>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Adresse Email (Lecture seule)</label>
              <input type="email" value={user?.email || ''} disabled style={{ backgroundColor: '#f3f4f6' }} />
            </div>

            <div className="form-group">
              <label>Numéro de Téléphone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: +212 600 000 000"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn-submit-green" disabled={updatingProfile}>
              {updatingProfile ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Historique d'Activité Structuré avec Chargement à la Demande (Lazy Loading) */}
      <div className="profile-section-card">
        <h2 className="section-card-title">
          <span>📊</span> Historique de mes Contributions & Activités
        </h2>

        {/* Onglets de sous-navigation d'activité */}
        <div className="activity-tabs-header">
          <button
            className={`activity-tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ideas'); setPage(1); }}
          >
            💡 Mes Idées ({summary.ideasCount})
          </button>
          <button
            className={`activity-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('comments'); setPage(1); }}
          >
            💬 Mes Commentaires ({summary.commentsCount})
          </button>
          <button
            className={`activity-tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => { setActiveTab('challenges'); setPage(1); }}
          >
            🏆 Défis & Favoris ({summary.challengesCount})
          </button>
          <button
            className={`activity-tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('interactions'); setPage(1); }}
          >
            👍 Interactions ({summary.interactionsCount})
          </button>
        </div>

        {/* Contenu dynamique paginé de l'onglet actif */}
        {tabLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#6b7280' }}>
            Chargement de vos activités...
          </div>
        ) : tabData.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              {activeTab === 'ideas' ? '💡' : activeTab === 'comments' ? '💬' : activeTab === 'challenges' ? '🏆' : '👍'}
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '0.35rem' }}>
              Aucune activité enregistrée ici
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              {activeTab === 'ideas'
                ? 'Vous n\'avez pas encore proposé d\'idée. Soumettez votre première contribution !'
                : activeTab === 'comments'
                ? 'Vous n\'avez pas encore rédigé de commentaire.'
                : activeTab === 'challenges'
                ? 'Aucun défi participé ou sauvegardé pour le moment.'
                : 'Vos votes et likes apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Onglet 1: Mes Idées */}
            {activeTab === 'ideas' && tabData.map((idea) => (
              <div
                key={idea._id}
                className="activity-item-card"
                onClick={() => navigate(`/ideas/${idea._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="idea-badge">{idea.category}</span>
                    <span className={`status-tag ${idea.status === 'approved' ? 'approved' : 'pending'}`}>
                      {idea.status === 'approved' ? 'Publiée' : 'En modération'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>{idea.title}</h4>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                  👍 {idea.voteCount || 0} votes
                </div>
              </div>
            ))}

            {/* Onglet 2: Mes Commentaires */}
            {activeTab === 'comments' && tabData.map((comment) => (
              <div key={comment._id} className="activity-item-card">
                <div>
                  <span style={{ fontSize: '0.775rem', color: '#9ca3af', fontWeight: 700 }}>
                    Sur l'idée : {comment.ideaId?.title || 'Idée collaborative'}
                  </span>
                  <p style={{ fontSize: '0.925rem', color: '#374151', marginTop: '0.25rem' }}>
                    "{comment.content}"
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}

            {/* Onglet 3: Mes Défis & Favoris */}
            {activeTab === 'challenges' && tabData.map((ch) => (
              <div
                key={ch._id}
                className="activity-item-card"
                onClick={() => navigate(`/challenges/${ch._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <span className="idea-badge" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                    {ch.category}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>{ch.title}</h4>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                  ★ Enregistré
                </span>
              </div>
            ))}

            {/* Onglet 4: Mes Interactions */}
            {activeTab === 'interactions' && tabData.map((item) => (
              <div key={item._id} className="activity-item-card">
                <div>
                  <span className="category-tag">{item.category}</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginTop: '0.25rem' }}>
                    {item.title}
                  </h4>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(item.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}

            {/* Contrôles de Pagination Paginée */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn-cancel"
                  style={{ fontSize: '0.85rem' }}
                >
                  ← Précédent
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563' }}>
                  Page {page} sur {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn-cancel"
                  style={{ fontSize: '0.85rem' }}
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
