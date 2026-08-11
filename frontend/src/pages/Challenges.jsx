import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallengesApi } from '../api/challengeApi';
import { useAuth } from '../context/AuthContext';
import AdminCreateChallengeCard from '../components/AdminCreateChallengeCard';
import './Challenges.css';

export default function Challenges() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Restriction Administrateur : Seul un administrateur authentifié peut créer un défi
  const isAdmin = user?.role === 'admin';

  // États des filtres (Status Tabs, Debounced Search, Category, Sort)
  const [status, setStatus] = useState('all'); // 'all' | 'open' | 'in_progress' | 'closed'
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [sort, setSort] = useState('recent'); // 'recent' | 'popular' | 'ending_soon'

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);

  const categoriesList = ['Toutes', 'Prévention', 'Transparence', 'Digital', 'Éducation'];

  // Flux de données réactif (useEffect avec Debounce 300ms sur la recherche)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChallenges();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status, category, sort]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        status,
        sort,
        category: category !== 'Toutes' ? category : undefined,
        search: search.trim() ? search.trim() : undefined
      };

      const data = await getChallengesApi(params);
      setChallenges(data.challenges || []);
    } catch (err) {
      console.error('Erreur chargement défis :', err);
      setError('Impossible de charger la liste des défis.');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (deadlineDate) => {
    if (!deadlineDate) return '';
    const diff = new Date(deadlineDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Terminé';
    return `J-${days}`;
  };

  return (
    <div className="challenges-container">
      {/* En-tête Défis */}
      <div className="challenges-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.85rem' }}>
            <span>🏆</span> Défis d'Innovation INPPLC
          </h1>
          <p className="section-subtitle">
            Relevez des défis stratégiques pour renforcer la probité et la transparence administrative au Maroc.
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
            <span>{showAdminForm ? 'Fermer le formulaire' : 'Créer un Défi'}</span>
          </button>
        )}
      </div>

      {/* Formulaire Administrateur de Création de Défi (Rendu en ligne sans modal qui se ferme) */}
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
            Tous les défis
          </button>
          <button
            className={`status-tab-btn ${status === 'open' ? 'active' : ''}`}
            onClick={() => setStatus('open')}
          >
            🟢 Ouverts
          </button>
          <button
            className={`status-tab-btn ${status === 'in_progress' ? 'active' : ''}`}
            onClick={() => setStatus('in_progress')}
          >
            🟠 En cours
          </button>
          <button
            className={`status-tab-btn ${status === 'closed' ? 'active' : ''}`}
            onClick={() => setStatus('closed')}
          >
            🔴 Clôturés
          </button>
        </div>

        <div className="controls-row">
          <div className="challenge-search-box">
            <span className="challenge-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un défi..."
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
                Catégorie: {cat}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">⏱️ Plus récents</option>
            <option value="ending_soon">⏳ Se termine bientôt</option>
            <option value="popular">🔥 Plus populaires</option>
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
          <button
            onClick={() => { setStatus('all'); setSearch(''); setCategory('Toutes'); setSort('recent'); }}
            className="btn-hero-primary"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="challenges-grid">
          {challenges.map((challenge) => {
            const currentParticipants = challenge.participantsCount || 0;
            const maxParticipants = challenge.maxParticipants || 100;
            const progressPercent = Math.min(100, Math.round((currentParticipants / maxParticipants) * 100));
            const daysText = getDaysRemaining(challenge.deadline);

            const displayStatus = challenge.computedStatus || challenge.status;

            return (
              <div
                key={challenge._id}
                className="challenge-card clickable-idea-card"
                onClick={() => navigate(`/challenges/${challenge._id}`)}
                title="Consulter les détails du défi"
              >
                <div>
                  <div className="challenge-card-header">
                    <span className={`challenge-status-badge ${displayStatus}`}>
                      {displayStatus === 'open' ? '🟢 Ouvert' : displayStatus === 'in_progress' ? '🟠 En cours' : displayStatus === 'upcoming' ? '🟡 À venir' : '🔴 Clôturé'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af' }}>
                      {daysText}
                    </span>
                  </div>

                  <h3 className="challenge-title">{challenge.title}</h3>
                  <p className="challenge-desc">{challenge.description}</p>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span className="idea-badge">{challenge.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'center' }}>
                      {challenge.locationMode === 'onsite' ? '📍 Présentiel' : '💻 À distance'}
                    </span>
                  </div>

                  {/* Barre de Progression */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Participants</span>
                      <span>{currentParticipants} / {maxParticipants}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Bas de Carte */}
                <div className="challenge-meta-row">
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Récompense</div>
                    <div className="reward-tag">{challenge.reward}</div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/challenges/${challenge._id}`); }}
                    className="btn-participate"
                  >
                    Consulter le défi →
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
