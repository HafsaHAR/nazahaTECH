import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIdeaByIdApi, voteIdeaApi } from '../api/ideaApi';
import { getCommentsApi, createCommentApi } from '../api/commentApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthPromptModal from '../components/AuthPromptModal';
import './IdeaDetail.css';

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t, translateText } = useLanguage();

  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalActionName, setModalActionName] = useState('');

  useEffect(() => {
    fetchIdeaAndComments();
  }, [id]);

  const fetchIdeaAndComments = async () => {
    try {
      setLoading(true);
      setError('');
      const ideaData = await getIdeaByIdApi(id);
      const parsedIdea = ideaData.idea || ideaData;
      setIdea(parsedIdea);

      const commentsData = await getCommentsApi(id);
      if (commentsData && Array.isArray(commentsData.comments)) {
        setComments(commentsData.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Erreur chargement détails idée :', err);
      setError('Impossible de charger les détails de cette idée.');
    } finally {
      setLoading(false);
    }
  };

  const triggerAuthPrompt = (actionLabel) => {
    setModalActionName(actionLabel);
    setAuthModalOpen(true);
  };

  const handleVote = async () => {
    if (!user) {
      triggerAuthPrompt('voter pour cette idée citoyenne');
      return;
    }

    try {
      const hasVoted = idea.voters?.includes(user.id) || idea.votes?.includes(user.id);
      const currentCount = idea.voteCount !== undefined ? idea.voteCount : (idea.voters?.length || 0);

      setIdea({
        ...idea,
        voteCount: hasVoted ? Math.max(0, currentCount - 1) : currentCount + 1
      });

      await voteIdeaApi(id);
    } catch (err) {
      console.error('Erreur vote :', err);
      fetchIdeaAndComments();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) {
      triggerAuthPrompt('laisser un commentaire');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      await createCommentApi({ ideaId: id, content: newComment.trim() });
      setNewComment('');
      const commentsData = await getCommentsApi(id);
      if (commentsData && Array.isArray(commentsData.comments)) {
        setComments(commentsData.comments);
      }
    } catch (err) {
      console.error('Erreur ajout commentaire :', err);
      alert('Impossible d\'ajouter votre commentaire.');
    } finally {
      setCommentLoading(false);
    }
  };

  const getAuthorName = (author) => {
    if (!author) return 'Citoyen NazahaTECH';
    if (typeof author === 'object') {
      if (author.firstName && author.lastName && author.firstName !== 'undefined') return `${author.firstName} ${author.lastName}`;
      if (author.name && author.name !== 'undefined undefined') return author.name;
      return author.email || 'Citoyen NazahaTECH';
    }
    return author;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Récemment';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Récemment';
    return d.toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR');
  };

  const hasVoted = user && (
    (Array.isArray(idea?.voters) && idea.voters.includes(user.id)) ||
    (Array.isArray(idea?.votes) && idea.votes.includes(user.id))
  );

  const votesDisplay = idea?.voteCount !== undefined ? idea.voteCount : (idea?.voters?.length || 0);

  if (loading) {
    return (
      <div className="idea-detail-container" style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
        Chargement de la fiche de l'idée...
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="idea-detail-container">
        <button onClick={() => navigate('/ideas')} className="btn-back">
          ← Retour aux idées
        </button>
        <div className="alert-error" style={{ padding: '1.5rem', textAlign: 'center' }}>
          {error || 'Idée introuvable.'}
        </div>
      </div>
    );
  }

  return (
    <div className="idea-detail-container">
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={modalActionName}
      />

      <button onClick={() => navigate('/ideas')} className="btn-back">
        ← Retour à la galerie des idées
      </button>

      <div className="idea-detail-card">
        <div className="idea-detail-header-tags">
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <span className="category-tag">🏷️ {translateText(idea?.category || 'Général')}</span>
            <span className={`status-tag ${idea?.status === 'approved' ? 'approved' : 'pending'}`}>
              {idea?.status === 'approved' ? 'Publiée & En ligne' : 'En attente de modération'}
            </span>
          </div>
          <span className="idea-date-badge">
            Publié le {formatDate(idea?.createdAt)}
          </span>
        </div>

        <h1 className="idea-detail-title">{translateText(idea?.title || 'Proposition d\'innovation')}</h1>

        <div className="idea-detail-description">
          {translateText(idea?.description || 'Aucune description fournie.')}
        </div>

        {/* Section Affichage des Pièces Jointes */}
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
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{att.fileSize} • {att.extension}</div>
                      </div>
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-download-doc"
                        download
                        style={{ marginTop: '0.65rem', padding: '0.4rem 0.65rem', fontSize: '0.775rem', textDecoration: 'none', textAlign: 'center' }}
                      >
                        {t('action.download')}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="idea-detail-author-row">
          <div className="author-info">
            <div className="author-avatar-large">
              {getAuthorName(idea?.author).substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                {getAuthorName(idea?.author)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Auteur de l'idée
              </div>
            </div>
          </div>

          <button
            onClick={handleVote}
            className={`btn-vote ${hasVoted ? 'voted' : ''}`}
            style={{ padding: '0.6rem 1.35rem', fontSize: '0.9rem' }}
          >
            👍 <strong>{votesDisplay}</strong> {hasVoted ? t('action.voted') : t('action.vote')}
          </button>
        </div>
      </div>

      {/* Section Commentaires */}
      <div className="comments-container">
        <h3 className="comments-title">
          <span>💬</span> Commentaires ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleAddComment} style={{ marginBottom: '1.75rem' }}>
            <textarea
              required
              rows={3}
              placeholder="Exprimez votre avis ou proposez une amélioration..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-textarea"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
              <button
                type="submit"
                disabled={commentLoading}
                className="btn-hero-primary"
                style={{ padding: '0.6rem 1.35rem', fontSize: '0.875rem' }}
              >
                {commentLoading ? 'Publication...' : t('action.comment')}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '1.25rem', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '12px', textAlign: 'center', marginBottom: '1.75rem' }}>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '0.65rem' }}>
              {t('guest.login_prompt')}
            </p>
            <button
              onClick={() => triggerAuthPrompt('laisser un commentaire')}
              className="btn-hero-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              {t('guest.login_btn')}
            </button>
          </div>
        )}

        {comments.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', padding: '1.75rem 0' }}>
            Aucun commentaire pour l'instant. Soyez le premier à commenter !
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {comments.map((comment) => (
              <div key={comment._id} className="comment-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                    {getAuthorName(comment.author)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5, margin: 0 }}>
                  {translateText(comment.content)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
