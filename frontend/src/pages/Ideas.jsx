import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIdeasApi, voteIdeaApi } from '../api/ideaApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthPromptModal from '../components/AuthPromptModal';
import './Ideas.css';
import './Challenges.css';
import './Dashboard.css';

export default function Ideas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [sort, setSort] = useState('recent');

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalActionName, setModalActionName] = useState('');

  const categoriesList = ['Toutes', 'Prévention', 'Transparence', 'Digital', 'Éducation'];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIdeas();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, sort, status]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (category !== 'Toutes') params.category = category;
      if (search.trim()) params.search = search.trim();
      if (sort) params.sort = sort;
      if (status !== 'all') params.status = status;

      const data = await getIdeasApi(params);
      setIdeas(data.ideas || []);
    } catch (err) {
      console.error('Erreur lors du chargement des idées :', err);
      setError('Impossible de charger la liste des idées.');
    } finally {
      setLoading(false);
    }
  };

  const triggerAuthPrompt = (actionLabel) => {
    setModalActionName(actionLabel);
    setAuthModalOpen(true);
  };

  const handleVoteOptimistic = async (e, ideaId) => {
    e.stopPropagation();

    if (!user) {
      triggerAuthPrompt('voter pour cette idée citoyenne');
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
      console.error('Erreur lors du vote, annulation optimiste :', err);
      setIdeas(originalIdeas);
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

  return (
    <div className="ideas-container">
      {/* Fenêtre Modale d'Invite à la Connexion pour le Visiteur */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={modalActionName}
      />

      {/* En-tête de la Galerie */}
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.85rem' }}>
            <span>💡</span> {t('ideas.title')}
          </h1>
          <p className="section-subtitle">
            {t('ideas.sub')}
          </p>
        </div>
        {user ? (
          <Link to="/submit-idea" className="btn-hero-primary" style={{ textDecoration: 'none' }}>
            + {t('nav.new_idea')}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => triggerAuthPrompt('soumettre une nouvelle idée')}
            className="btn-hero-primary"
            style={{ textDecoration: 'none' }}
          >
            + {t('nav.new_idea')}
          </button>
        )}
      </div>

      {/* Barre de Filtrage Identique à celle des Défis */}
      <div className="challenges-filter-panel">
        <div className="status-tabs-row">
          <button
            className={`status-tab-btn ${status === 'all' ? 'active' : ''}`}
            onClick={() => setStatus('all')}
          >
            Toutes les idées
          </button>
          <button
            className={`status-tab-btn ${status === 'approved' ? 'active' : ''}`}
            onClick={() => setStatus('approved')}
          >
            🟢 Publiées
          </button>
          {user?.role === 'admin' && (
            <button
              className={`status-tab-btn ${status === 'pending' ? 'active' : ''}`}
              onClick={() => setStatus('pending')}
            >
              🟠 En modération
            </button>
          )}
        </div>

        <div className="controls-row">
          <div className="challenge-search-box">
            <span className="challenge-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher une idée..."
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
            <option value="popular">👍 Plus populaires</option>
          </select>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Grille des Idées */}
      {loading ? (
        <div className="ideas-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : ideas.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Aucune idée ne correspond à vos critères
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Essayez de modifier votre recherche ou réinitialisez les filtres.
          </p>
          <button
            onClick={() => { setSearch(''); setCategory('Toutes'); setSort('recent'); setStatus('all'); }}
            className="btn-hero-primary"
            style={{ textDecoration: 'none' }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="ideas-grid">
          {ideas.map((idea) => (
            <div
              key={idea._id}
              className="idea-card clickable-idea-card"
              onClick={() => navigate(`/ideas/${idea._id}`)}
              title="Cliquer pour voir la fiche détaillée de l'idée"
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
                <button
                  className="vote-btn"
                  onClick={(e) => handleVoteOptimistic(e, idea._id)}
                  title={user ? t('action.vote') : t('guest.login_prompt')}
                >
                  👍 <span>{idea.voteCount || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
