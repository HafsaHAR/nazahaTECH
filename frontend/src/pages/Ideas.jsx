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
  const { lang, t, translateText } = useLanguage();

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
      const data = await getIdeasApi({ status, search, category, sort });
      if (data && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      } else {
        setIdeas([]);
      }
    } catch (err) {
      console.error('Erreur chargement idées :', err);
      setError(err.message || 'Erreur lors du chargement des idées.');
    } finally {
      setLoading(false);
    }
  };

  const triggerAuthPrompt = (actionLabel) => {
    setModalActionName(actionLabel);
    setAuthModalOpen(true);
  };

  const handleVote = async (e, ideaId) => {
    e.stopPropagation();

    if (!user) {
      triggerAuthPrompt('voter pour cette idée');
      return;
    }

    try {
      setIdeas((prev) =>
        prev.map((item) => {
          if (item._id === ideaId) {
            const hasVoted = item.votes?.includes(user.id);
            const newVotes = hasVoted
              ? item.votes.filter((id) => id !== user.id)
              : [...(item.votes || []), user.id];
            return { ...item, votes: newVotes, votesCount: newVotes.length };
          }
          return item;
        })
      );
      await voteIdeaApi(ideaId);
    } catch (err) {
      console.error('Erreur vote :', err);
      fetchIdeas();
    }
  };

  const getAuthorName = (author) => {
    if (!author) return 'Citoyen Anonyme';
    if (typeof author === 'object') {
      if (author.firstName && author.lastName && author.firstName !== 'undefined') {
        return `${author.firstName} ${author.lastName}`;
      }
      if (author.name && author.name !== 'undefined undefined') {
        return author.name;
      }
      return author.email || 'Citoyen NazahaTECH';
    }
    return author;
  };

  return (
    <div className="ideas-page-container">
      {/* Fenêtre Modale d'invitation à la connexion pour les visiteurs */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={modalActionName}
      />

      {/* En-tête de la Galerie */}
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.85rem' }}>
            {t('ideas.title')}
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

      {/* Barre de Filtrage */}
      <div className="challenges-filter-panel">
        <div className="status-tabs-row">
          <button
            className={`status-tab-btn ${status === 'all' ? 'active' : ''}`}
            onClick={() => setStatus('all')}
          >
            {translateText('Toutes les idées')}
          </button>
          <button
            className={`status-tab-btn ${status === 'approved' ? 'active' : ''}`}
            onClick={() => setStatus('approved')}
          >
            {translateText('Publiées')}
          </button>
          {user?.role === 'admin' && (
            <button
              className={`status-tab-btn ${status === 'pending' ? 'active' : ''}`}
              onClick={() => setStatus('pending')}
            >
              {translateText('En modération')}
            </button>
          )}
        </div>

        <div className="controls-row">
          <div className="challenge-search-box">
            <span className="challenge-search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('ideas.search_ph')}
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
                {cat === 'Toutes' ? t('ideas.filter_all_cat') : translateText(cat)}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">{t('ideas.sort_newest')}</option>
            <option value="popular">{t('ideas.sort_popular')}</option>
          </select>
        </div>
      </div>

      {/* Contenu & Liste d'Idées */}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="ideas-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">💡</div>
          <h3>Aucune idée trouvée</h3>
          <p>Soyez le premier à proposer une idée pour renforcer la probité et la transparence !</p>
          {user ? (
            <Link to="/submit-idea" className="btn-hero-primary" style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-block' }}>
              + Proposer la première idée
            </Link>
          ) : (
            <button onClick={() => triggerAuthPrompt('soumettre une idée')} className="btn-hero-primary" style={{ marginTop: '1rem' }}>
              + Proposer la première idée
            </button>
          )}
        </div>
      ) : (
        <div className="ideas-grid">
          {ideas.map((idea) => {
            const hasVoted = user && Array.isArray(idea.votes) && idea.votes.includes(user.id);

            return (
              <div
                key={idea._id}
                className="idea-card"
                onClick={() => navigate(`/ideas/${idea._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="idea-card-header">
                    <span className="idea-category-tag">{translateText(idea.category || 'Général')}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {new Date(idea.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR')}
                    </span>
                  </div>

                  <h3 className="idea-title">{translateText(idea.title)}</h3>
                  <p className="idea-desc">{translateText(idea.description)}</p>
                </div>

                <div className="idea-card-footer" onClick={(e) => e.stopPropagation()}>
                  <div className="author-info">
                    <div className="author-avatar-small">
                      {getAuthorName(idea.author).substring(0, 2).toUpperCase()}
                    </div>
                    <span className="author-name-text">{getAuthorName(idea.author)}</span>
                  </div>

                  <button
                    onClick={(e) => handleVote(e, idea._id)}
                    className={`btn-vote ${hasVoted ? 'voted' : ''}`}
                    title={hasVoted ? 'Retirer mon vote' : 'Voter pour cette idée'}
                  >
                    👍 <strong>{idea.votesCount || idea.votes?.length || 0}</strong> {hasVoted ? t('action.voted') : t('action.vote')}
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
