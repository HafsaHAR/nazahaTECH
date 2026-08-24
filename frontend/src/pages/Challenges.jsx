import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallengesApi } from '../api/challengeApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthPromptModal from '../components/AuthPromptModal';
import AdminCreateChallengeCard from '../components/AdminCreateChallengeCard';
import './Challenges.css';

export default function Challenges() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, translateText } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [sort, setSort] = useState('recent');

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalActionName, setModalActionName] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);

  const categoriesList = ['Toutes', 'Prévention', 'Transparence', 'Digital', 'Éducation'];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChallenges();
    }, 300);
    return () => clearTimeout(timer);
  }, [status, search, category, sort]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getChallengesApi({ status, search, category, sort });
      if (data && Array.isArray(data.challenges)) {
        setChallenges(data.challenges);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      console.error('Erreur chargement défis :', err);
      setError('Impossible de charger la liste des défis. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = (challengeId, challengeTitle) => {
    if (!user) {
      setModalActionName(`participer au défi "${challengeTitle}"`);
      setAuthModalOpen(true);
      return;
    }
    navigate(`/submit-idea?challengeId=${challengeId}`);
  };

  const getStatusBadgeInfo = (c) => {
    const s = (c.status || '').toLowerCase();
    if (s === 'closed' || s === 'cloture') {
      return {
        label: t('challenges.status_closed'),
        color: '#b91c1c',
        bgColor: '#fee2e2'
      };
    }
    if (s === 'in_progress' || s === 'en_cours') {
      return {
        label: translateText('En cours'),
        color: '#b45309',
        bgColor: '#fef3c7'
      };
    }
    return {
      label: translateText('Ouverts'),
      color: '#15803d',
      bgColor: '#dcfce7'
    };
  };

  return (
    <div className="challenges-page-container">
      {/* Fenêtre Modale d'invitation à la connexion */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={modalActionName}
      />

      {/* En-tête de Section */}
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.85rem' }}>
            {t('challenges.title')}
          </h1>
          <p className="section-subtitle">
            {t('challenges.sub')}
          </p>
        </div>

        {/* Bouton de création STRICTEMENT RÉSERVÉ AUX ADMINISTRATEURS */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAdminForm(!showAdminForm)}
            className="btn-hero-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem', cursor: 'pointer' }}
          >
            <span>{showAdminForm ? '✕' : '⊕'}</span>
            <span>{showAdminForm ? t('action.close') : t('action.create_challenge')}</span>
          </button>
        )}
      </div>

      {/* Formulaire Administrateur de Création de Défi */}
      {isAdmin && showAdminForm && (
        <AdminCreateChallengeCard
          onSuccess={fetchChallenges}
          onClose={() => setShowAdminForm(false)}
        />
      )}

      {/* Barre de Filtrage Complète */}
      <div className="challenges-filter-panel">
        <div className="status-tabs-row">
          <button
            className={`status-tab-btn ${status === 'all' ? 'active' : ''}`}
            onClick={() => setStatus('all')}
          >
            {translateText('Tous les défis')}
          </button>
          <button
            className={`status-tab-btn ${status === 'open' ? 'active' : ''}`}
            onClick={() => setStatus('open')}
          >
            {translateText('Ouverts')}
          </button>
          <button
            className={`status-tab-btn ${status === 'in_progress' ? 'active' : ''}`}
            onClick={() => setStatus('in_progress')}
          >
            {translateText('En cours')}
          </button>
          <button
            className={`status-tab-btn ${status === 'closed' ? 'active' : ''}`}
            onClick={() => setStatus('closed')}
          >
            {translateText('Clôturés')}
          </button>
        </div>

        <div className="controls-row">
          <div className="challenge-search-box">
            <span className="challenge-search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('challenges.search_ph')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {t('meta.category')}: {translateText(cat)}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">⏱️ {t('ideas.sort_newest')}</option>
            <option value="ending_soon">⏳ {translateText('En cours')}</option>
            <option value="popular">🔥 {t('ideas.sort_popular')}</option>
          </select>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Grille des Défis */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Chargement des défis INPPLC depuis la BDD...
        </div>
      ) : challenges.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Aucun défi ne correspond à votre sélection
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Essayez de modifier votre recherche ou de changer les filtres de statut.
          </p>
        </div>
      ) : (
        <div className="challenges-grid">
          {challenges.map((c) => {
            const badgeInfo = getStatusBadgeInfo(c);

            return (
              <div
                key={c._id}
                className="challenge-card"
                onClick={() => navigate(`/challenges/${c._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span className="challenge-badge">{translateText(c.category || 'INPPLC')}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: badgeInfo.color, backgroundColor: badgeInfo.bgColor, padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                      {badgeInfo.label}
                    </span>
                  </div>

                  <h3 className="challenge-title">{translateText(c.title)}</h3>
                  <p className="challenge-desc">{translateText(c.description)}</p>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 600 }}>
                    👥 <strong>{c.participantsCount || 0}</strong> {t('meta.participants')}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleParticipate(c._id, c.title); }}
                    className="btn-hero-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    {t('challenges.participate_btn')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
