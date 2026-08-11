import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIdeaByIdApi, voteIdeaApi } from '../api/ideaApi';
import { getCommentsApi, createCommentApi } from '../api/commentApi';
import { useAuth } from '../context/AuthContext';
import CommentItem from '../components/CommentItem';
import './IdeaDetail.css';

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [is404, setIs404] = useState(false);

  // État optimiste du vote sur l'idée
  const [voteCount, setVoteCount] = useState(0);
  const [voted, setVoted] = useState(false);

  // États du système avancé de commentaires imbriqués
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSort, setCommentSort] = useState('recent'); // 'recent' | 'popular'
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchIdeaDetail = async () => {
    try {
      setLoading(true);
      setError('');
      setIs404(false);

      const data = await getIdeaByIdApi(id);

      if (data && data.idea) {
        setIdea(data.idea);
        setVoteCount(data.idea.voteCount || 0);

        if (user && data.idea.voters) {
          const hasVoted = data.idea.voters.some(
            (voterId) => voterId === user._id || voterId._id === user._id
          );
          setVoted(hasVoted);
        }
      } else {
        setIs404(true);
      }
    } catch (err) {
      console.error('Erreur chargement idée :', err);
      if (err.response?.status === 404) {
        setIs404(true);
      } else {
        setError('Impossible de charger les détails de cette idée.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const data = await getCommentsApi(id, commentSort);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Erreur chargement commentaires :', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeaDetail();
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id, commentSort]);

  // Vote optimiste sur l'idée avec rollback automatique
  const handleVoteOptimistic = async () => {
    if (!idea) return;

    const previousVoteCount = voteCount;
    const previousVoted = voted;

    if (voted) {
      setVoted(false);
      setVoteCount((prev) => Math.max(0, prev - 1));
    } else {
      setVoted(true);
      setVoteCount((prev) => prev + 1);
    }

    try {
      const response = await voteIdeaApi(idea._id);
      if (response && response.idea) {
        setVoteCount(response.idea.voteCount);
      }
    } catch (err) {
      console.error('Échec vote idée, rollback :', err);
      setVoteCount(previousVoteCount);
      setVoted(previousVoted);
    }
  };

  // Soumission optimiste d'un commentaire racine
  const handlePostRootComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);

    try {
      await createCommentApi({
        ideaId: id,
        content: newCommentText.trim()
      });

      setNewCommentText('');
      fetchComments();
    } catch (err) {
      console.error('Erreur soumission commentaire :', err);
    } finally {
      setSubmittingComment(false);
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

  const getInitials = (author) => {
    if (typeof author === 'object' && author?.firstName && author?.lastName) {
      return `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
    }
    return 'IN';
  };

  if (loading) {
    return (
      <div className="idea-detail-container" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        <p>Chargement des détails de l'idée depuis MongoDB...</p>
      </div>
    );
  }

  if (is404) {
    return (
      <div className="idea-detail-container">
        <button onClick={() => navigate('/ideas')} className="btn-back">
          ← Retour aux idées
        </button>
        <div className="error-404-card">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💡</div>
          <h2 style={{ color: '#111827', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Idée introuvable
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.75rem', maxWidth: '500px', margin: '0 auto 1.75rem' }}>
            L'idée que vous recherchez n'existe pas ou a été retirée par l'administration.
          </p>
          <button onClick={() => navigate('/ideas')} className="btn-comment" style={{ padding: '0.75rem 1.75rem' }}>
            Découvrir d'autres idées
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="idea-detail-container">
        <button onClick={() => navigate('/ideas')} className="btn-back">
          ← Retour aux idées
        </button>
        <div className="alert-error" style={{ padding: '1.5rem', textAlign: 'center' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="idea-detail-container">
      {/* Bouton de retour */}
      <button onClick={() => navigate('/ideas')} className="btn-back">
        ← Retour à la galerie des idées
      </button>

      {/* Carte de l'Idée */}
      <div className="idea-detail-card">
        <div className="idea-detail-header-tags">
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <span className="category-tag">{idea?.category}</span>
            <span className={`status-tag ${idea?.status === 'approved' ? 'approved' : 'pending'}`}>
              {idea?.status === 'approved' ? 'Publiée & En ligne' : 'En attente de modération'}
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Soumis le {new Date(idea?.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>

        <h1 className="idea-detail-title">{idea?.title}</h1>

        <div className="idea-detail-description">
          {idea?.description}
        </div>

        {/* Profil Auteur & Bouton Vote */}
        <div className="author-box">
          <div className="author-info">
            <div className="author-avatar-large">
              {getInitials(idea?.author)}
            </div>
            <div>
              <div className="author-name">{getAuthorName(idea?.author)}</div>
              <div className="author-role">
                {idea?.author?.role === 'admin' ? 'Administrateur INPPLC' : 'Membre Citoyen'}
              </div>
            </div>
          </div>

          <button
            onClick={handleVoteOptimistic}
            className={`vote-btn ${voted ? 'voted' : ''}`}
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '0.95rem',
              backgroundColor: voted ? 'var(--primary-green-light)' : '#f3f4f6',
              borderColor: voted ? 'var(--primary-green)' : '#e5e7eb',
              color: voted ? 'var(--primary-green)' : '#374151'
            }}
          >
            👍 <span>{voteCount} {voteCount > 1 ? 'Votes' : 'Vote'}</span>
          </button>
        </div>
      </div>

      {/* Section Avancée de Commentaires Imbriqués */}
      <div className="comments-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="comments-title" style={{ margin: 0 }}>
            <span>💬</span> Échanges & Commentaires ({comments.length})
          </h2>

          {/* Tri des commentaires (Recent vs Popular) */}
          <select
            value={commentSort}
            onChange={(e) => setCommentSort(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="recent">⏱️ Plus récents</option>
            <option value="popular">👍 Plus populaires</option>
          </select>
        </div>

        {/* Formulaire de publication de commentaire racine */}
        <form onSubmit={handlePostRootComment} className="comment-input-box">
          <input
            type="text"
            className="comment-input"
            placeholder="Partagez vos réflexions ou améliorations..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <button type="submit" className="btn-comment" disabled={submittingComment}>
            {submittingComment ? 'Publication...' : 'Commenter'}
          </button>
        </form>

        {/* Arborescence des commentaires imbriqués (CommentTree) */}
        {commentsLoading ? (
          <p style={{ color: '#6b7280', padding: '1rem 0' }}>Chargement des commentaires...</p>
        ) : comments.length === 0 ? (
          <p style={{ color: '#6b7280', padding: '1.5rem 0', textAlign: 'center' }}>
            Aucun commentaire pour le moment. Soyez le premier à réagir !
          </p>
        ) : (
          <div className="comments-tree">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                ideaId={id}
                currentUser={user}
                onCommentUpdated={fetchComments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
