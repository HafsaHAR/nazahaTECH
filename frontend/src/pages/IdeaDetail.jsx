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

  // États des commentaires
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSort, setCommentSort] = useState('recent');
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
      <button onClick={() => navigate('/ideas')} className="btn-back">
        ← Retour à la galerie des idées
      </button>

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

        {/* Section Affichage des Pièces Jointes & Fichiers de l'Idée */}
        {idea?.attachments && idea.attachments.length > 0 && (
          <div style={{ marginTop: '1.75rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>📎</span> Pièces Jointes & Documents Joins ({idea.attachments.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {idea.attachments.map((att, idx) => {
                const isImage = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes(att.extension?.toUpperCase());
                return (
                  <div key={idx} style={{ border: '1px solid #d1d5db', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
                    {isImage ? (
                      <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img src={att.fileUrl} alt={att.fileName} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                      </a>
                    ) : (
                      <div style={{ height: '80px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                        📄
                      </div>
                    )}
                    <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', wordBreak: 'break-word' }}>{att.fileName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{att.extension} • {att.fileSize}</div>
                      </div>
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="btn-cancel"
                        style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.35rem 0.6rem', textAlign: 'center', display: 'block' }}
                      >
                        📥 Consulter / Télécharger
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="author-box" style={{ marginTop: '1.75rem' }}>
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

      {/* Section Commentaires */}
      <div className="comments-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="comments-title" style={{ margin: 0 }}>
            <span>💬</span> Échanges & Commentaires ({comments.length})
          </h2>

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
