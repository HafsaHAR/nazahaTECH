import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { replyToCommentApi, reactToCommentApi, deleteCommentApi } from '../api/commentApi';
import './CommentItem.css';

export default function CommentItem({
  comment,
  ideaId,
  currentUser,
  onCommentUpdated
}) {
  const navigate = useNavigate();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentUserId = currentUser?._id;
  const initialLikes = comment.likes || [];
  const initialDislikes = comment.dislikes || [];

  const [hasLiked, setHasLiked] = useState(
    initialLikes.some((id) => id === currentUserId || id._id === currentUserId)
  );
  const [hasDisliked, setHasDisliked] = useState(
    initialDislikes.some((id) => id === currentUserId || id._id === currentUserId)
  );
  const [likeCount, setLikeCount] = useState(comment.likeCount || initialLikes.length || 0);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikeCount || initialDislikes.length || 0);

  const handleReactOptimistic = async (type) => {
    // Protection Invité (Guest Restriction) : Redirection vers /login
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const prevLiked = hasLiked;
    const prevDisliked = hasDisliked;
    const prevLikeCount = likeCount;
    const prevDislikeCount = dislikeCount;

    if (type === 'like') {
      if (hasLiked) {
        setHasLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        setHasLiked(true);
        setLikeCount((prev) => prev + 1);
        if (hasDisliked) {
          setHasDisliked(false);
          setDislikeCount((prev) => Math.max(0, prev - 1));
        }
      }
    } else if (type === 'dislike') {
      if (hasDisliked) {
        setHasDisliked(false);
        setDislikeCount((prev) => Math.max(0, prev - 1));
      } else {
        setHasDisliked(true);
        setDislikeCount((prev) => prev + 1);
        if (hasLiked) {
          setHasLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      }
    }

    try {
      await reactToCommentApi(comment._id, type);
      if (onCommentUpdated) onCommentUpdated();
    } catch (err) {
      console.error('Échec réaction comment :', err);
      setHasLiked(prevLiked);
      setHasDisliked(prevDisliked);
      setLikeCount(prevLikeCount);
      setDislikeCount(prevDislikeCount);
    }
  };

  const handleToggleReplyForm = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    setErrorMsg('');

    try {
      await replyToCommentApi(comment._id, {
        ideaId,
        content: replyText.trim()
      });
      setReplyText('');
      setShowReplyForm(false);
      if (onCommentUpdated) onCommentUpdated();
    } catch (err) {
      console.error('Erreur réponse :', err);
      const msg = err.response?.data?.message || 'Erreur lors de l\'envoi de la réponse.';
      setErrorMsg(msg);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous supprimer ce commentaire ?')) return;

    try {
      await deleteCommentApi(comment._id);
      if (onCommentUpdated) onCommentUpdated();
    } catch (err) {
      console.error('Erreur suppression :', err);
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

  return (
    <div className={`comment-item ${comment.isDeleted ? 'is-deleted' : ''}`}>
      <div className="comment-header">
        <div className="comment-author-info">
          <div className="comment-avatar">
            {getInitials(comment.author)}
          </div>
          <div>
            <span className="comment-author-name">{getAuthorName(comment.author)}</span>
            {comment.author?.role === 'admin' && (
              <span className="comment-author-role">• Administrateur</span>
            )}
          </div>
        </div>
        <span className="comment-date">
          {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      <div className={`comment-content ${comment.isDeleted ? 'deleted-text' : ''}`}>
        {comment.content}
      </div>

      {!comment.isDeleted && (
        <div className="comment-actions-bar">
          <button
            className={`comment-action-btn ${hasLiked ? 'active-like' : ''}`}
            onClick={() => handleReactOptimistic('like')}
            title="Aimer"
          >
            👍 <span>{likeCount}</span>
          </button>

          <button
            className={`comment-action-btn ${hasDisliked ? 'active-dislike' : ''}`}
            onClick={() => handleReactOptimistic('dislike')}
            title="Ne pas aimer"
          >
            👎 <span>{dislikeCount}</span>
          </button>

          <button
            className="comment-action-btn"
            onClick={handleToggleReplyForm}
          >
            💬 Répondre
          </button>

          {currentUser?.role === 'admin' && (
            <button className="comment-action-btn delete-btn" onClick={handleDelete}>
              🗑️ Supprimer
            </button>
          )}
        </div>
      )}

      {errorMsg && <div className="alert-error" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{errorMsg}</div>}

      {showReplyForm && (
        <form onSubmit={handleSendReply} className="inline-reply-box">
          <input
            type="text"
            className="inline-reply-input"
            placeholder={`Répondre à ${getAuthorName(comment.author)}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-send-reply" disabled={submittingReply}>
            {submittingReply ? '...' : 'Envoyer'}
          </button>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="nested-replies-list">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              ideaId={ideaId}
              currentUser={currentUser}
              onCommentUpdated={onCommentUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
