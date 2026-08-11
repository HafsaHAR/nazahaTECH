import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChallengeByIdApi, toggleBookmarkApi } from '../api/challengeApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './ChallengeDetail.css';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getChallengeByIdApi(id);
        if (data && data.challenge) {
          setChallenge(data.challenge);
          setIsSaved(data.challenge.isSaved || false);
        } else {
          setError('Défi introuvable.');
        }
      } catch (err) {
        console.error('Erreur chargement défi :', err);
        setError('Impossible de charger les détails de ce défi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleToggleBookmarkOptimistic = async () => {
    // Protection Invité (Guest Restriction) : Redirection vers /login
    if (!user) {
      navigate('/login');
      return;
    }

    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      const response = await toggleBookmarkApi(id);
      if (response && typeof response.isSaved === 'boolean') {
        setIsSaved(response.isSaved);
      }
    } catch (err) {
      console.error('Erreur favori, annulation :', err);
      setIsSaved(previousState);
    }
  };

  const handleParticipate = () => {
    // Protection Invité (Guest Restriction) : Redirection vers /login
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/submit-idea?challenge=${challenge._id}`);
  };

  if (loading) {
    return (
      <div className="challenge-detail-container" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        <p>Chargement des détails du défi depuis MongoDB...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="challenge-detail-container">
        <button onClick={() => navigate('/challenges')} className="btn-back">
          ← Retour aux défis
        </button>
        <div className="alert-error" style={{ textAlign: 'center', padding: '2rem' }}>
          {error || 'Défi introuvable.'}
        </div>
      </div>
    );
  }

  const currentParticipants = challenge.participantsCount || 0;
  const maxParticipants = challenge.maxParticipants || 100;
  const progressPercent = Math.min(100, Math.round((currentParticipants / maxParticipants) * 100));

  const sortedExtraFields = [...(challenge.extraFields || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const statusLabel =
    challenge.computedStatus === 'upcoming'
      ? '🟡 À venir'
      : challenge.computedStatus === 'open'
      ? '🟢 Actif & Ouvert'
      : '🔴 Clôturé';

  return (
    <div className="challenge-detail-container">
      <button onClick={() => navigate('/challenges')} className="btn-back">
        ← Retour à la liste des défis
      </button>

      <div className="challenge-detail-card">
        <div className="challenge-detail-header">
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`challenge-status-badge ${challenge.computedStatus || 'open'}`}>
              {statusLabel}
            </span>
            <span className="category-tag">{challenge.category}</span>
            <span className="location-badge">
              {challenge.locationMode === 'onsite' ? `📍 ${challenge.locationAddress || 'Présentiel'}` : '💻 À distance'}
            </span>
          </div>

          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>
            Durée: {challenge.duration || '4 semaines'}
          </span>
        </div>

        <h1 className="challenge-detail-title">{challenge.title}</h1>
        <p className="challenge-detail-desc">{challenge.description}</p>

        <div className="dates-breakdown-card">
          <div className="date-item">
            <span className="date-label">📅 Date de Début</span>
            <span className="date-value">
              {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
            </span>
          </div>

          <div className="date-item">
            <span className="date-label">🏁 Date de Fin</span>
            <span className="date-value">
              {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
            </span>
          </div>

          <div className="date-item">
            <span className="date-label">⏳ Limite Candidature</span>
            <span className="date-value" style={{ color: 'var(--primary-gold)' }}>
              {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString('fr-FR') : 'Non spécifié'}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
            <span style={{ color: '#4b5563' }}>Participants inscrits</span>
            <span style={{ color: '#111827' }}>{currentParticipants} / {maxParticipants}</span>
          </div>
          <div className="progress-track" style={{ height: '10px' }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="challenge-actions-row">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Récompense Officielle</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-green)' }}>
              {challenge.reward}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button
              onClick={handleToggleBookmarkOptimistic}
              className={`btn-bookmark ${isSaved ? 'saved' : ''}`}
              title={user ? t('action.bookmark') : t('guest.login_prompt')}
            >
              <span>{isSaved ? '★' : '☆'}</span>
              <span>{isSaved ? t('action.bookmarked') : t('action.bookmark')}</span>
            </button>

            {challenge.computedStatus !== 'closed' ? (
              <button
                onClick={handleParticipate}
                className="btn-hero-primary"
                style={{ padding: '0.75rem 1.6rem' }}
              >
                Participer à ce défi →
              </button>
            ) : (
              <span style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 600, alignSelf: 'center' }}>
                Ce défi est clôturé
              </span>
            )}
          </div>
        </div>
      </div>

      {sortedExtraFields.length > 0 && (
        <div className="dynamic-extra-sections">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
            🧩 Informations & Modalités du Défi
          </h2>

          {sortedExtraFields.map((field, idx) => (
            <div key={idx} className="extra-section-card">
              <h3 className="extra-section-title">
                <span>📌</span> {field.title}
              </h3>
              <div className="extra-section-content">
                {field.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
