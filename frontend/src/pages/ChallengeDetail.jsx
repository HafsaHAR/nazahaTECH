import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChallengeByIdApi, toggleBookmarkApi } from '../api/challengeApi';
import { getChallengeSubmissionsApi, updateChallengeSubmissionStatusApi } from '../api/challengeSubmissionApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './ChallengeDetail.css';
import './Dashboard.css';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, translateText } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // États pour les soumissions spécifiques au défi (Vue Admin)
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

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

  // Charger les soumissions des participants si l'utilisateur est Admin
  useEffect(() => {
    if (isAdmin && id) {
      fetchSubmissions();
    }
  }, [isAdmin, id]);

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const res = await getChallengeSubmissionsApi(id);
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Erreur chargement soumissions admin :', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleUpdateStatus = async (subId, newStatus) => {
    try {
      setUpdatingId(subId);
      await updateChallengeSubmissionStatusApi(subId, { status: newStatus });
      fetchSubmissions();
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBookmarkOptimistic = async () => {
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
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/submit-challenge?challengeId=${challenge._id}`);
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

  const getCandidateName = (u) => {
    if (!u) return 'Candidat Anonyme';
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    return u.email || 'Candidat NazahaTECH';
  };

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
            <span className="category-tag">{translateText(challenge.category)}</span>
            <span className="location-badge">
              {challenge.locationMode === 'onsite' ? `📍 ${challenge.locationAddress || 'Présentiel'}` : '💻 À distance'}
            </span>
          </div>

          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>
            Durée: {challenge.duration || '4 semaines'}
          </span>
        </div>

        <h1 className="challenge-detail-title">{translateText(challenge.title)}</h1>
        <p className="challenge-detail-desc">{translateText(challenge.description)}</p>

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

      {/* Section Réservée à l'Admin : Consultation et Évaluation des Soumissions au Défi */}
      {isAdmin && (
        <div style={{ marginTop: '2rem', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '1.75rem', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎯 Soumissions des Participants ({submissions.length}) — Espace Admin
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' }}>
            Ces propositions sont stockées spécifiquement dans la BDD `ChallengeSubmission` et isolées de la galerie d'idées citoyennes.
          </p>

          {loadingSubmissions ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>Chargement des soumissions au défi...</div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '12px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
              Aucun participant n'a encore soumis de solution pour ce défi.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.map((sub, index) => (
                <div
                  key={sub._id}
                  className="moderation-card"
                  style={{ borderLeft: sub.status === 'accepted' ? '4px solid #15803d' : sub.status === 'rejected' ? '4px solid #dc2626' : '4px solid #d97706', padding: '1.25rem' }}
                >
                  <div className="moderation-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="moderation-badge approved" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                        Soumission #{index + 1}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Déposée le {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <h3 className="moderation-title" style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                      {sub.title}
                    </h3>
                    <p className="moderation-desc" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      {sub.description}
                    </p>

                    {Array.isArray(sub.attachments) && sub.attachments.length > 0 && (
                      <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {sub.attachments.map((att, aIdx) => (
                          <a
                            key={aIdx}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.775rem', fontWeight: 700, backgroundColor: '#f3f4f6', color: '#111827', padding: '0.25rem 0.65rem', borderRadius: '6px', textDecoration: 'none' }}
                          >
                            📎 {att.fileName} ({att.fileSize})
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="moderation-meta">
                      <span>Candidat : <strong>{getCandidateName(sub.userId)}</strong> ({sub.userId?.email})</span>
                      <span>Statut BDD : <strong style={{ color: sub.status === 'accepted' ? '#15803d' : sub.status === 'rejected' ? '#b91c1c' : '#b45309' }}>
                        {sub.status === 'accepted' ? '🟢 Acceptée' : sub.status === 'rejected' ? '🔴 Rejetée' : '⏳ En modération'}
                      </strong></span>
                    </div>
                  </div>

                  <div className="moderation-actions">
                    <button
                      onClick={() => handleUpdateStatus(sub._id, 'accepted')}
                      disabled={updatingId === sub._id}
                      className="btn-approve"
                    >
                      {updatingId === sub._id ? '⏳...' : '✓ Accepter'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sub._id, 'rejected')}
                      disabled={updatingId === sub._id}
                      className="btn-reject"
                    >
                      {updatingId === sub._id ? '⏳...' : '✕ Rejeter'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sections supplémentaires du défi */}
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
