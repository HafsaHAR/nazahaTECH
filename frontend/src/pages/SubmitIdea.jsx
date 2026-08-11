import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createIdeaApi } from '../api/ideaApi';
import './SubmitIdea.css';

export default function SubmitIdea() {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challenge');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prévention');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError('Veuillez remplir le titre et la description.');
      return;
    }

    if (title.trim().length < 3) {
      setError('Le titre doit contenir au moins 3 caractères.');
      return;
    }

    if (description.trim().length < 10) {
      setError('La description doit contenir au moins 10 caractères.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        challengeId: challengeId || null
      };

      const response = await createIdeaApi(payload);
      console.log('✅ Idée enregistrée avec succès en BDD :', response);

      setSubmitted(true);
      setTimeout(() => {
        navigate('/ideas');
      }, 1500);

    } catch (err) {
      console.error('❌ Erreur lors de la création de l\'idée :', err);
      
      if (err.response?.status === 401 || err.response?.data?.message?.includes('Non autorisé')) {
        setError('Votre session a expiré (ancien token). Déconnexion automatique...');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } else {
        const msg = err.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde de votre idée.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-idea-container">
      {/* Header Dynamique */}
      {!challengeId && (
        <div className="submit-header">
          <h1 className="submit-title">Soumettre une idée</h1>
          <p className="submit-sub">
            Décrivez clairement votre proposition. La communauté pourra voter et commenter.
          </p>
        </div>
      )}

      <div className="submit-idea-card">
        {/* Encadré Récompense (Si soumission pour un défi spécifique) */}
        {challengeId && (
          <div className="challenge-reward-box">
            <div>
              <div className="reward-label">Récompense</div>
              <div className="reward-amount">50 000 MAD + accompagnement</div>
            </div>
            <button onClick={() => navigate('/challenges')} className="btn-cancel" style={{ padding: '0.5rem 1rem' }}>
              Annuler
            </button>
          </div>
        )}

        {error && (
          <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: '#006837', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {challengeId ? 'Participation transmise et enregistrée !' : 'Idée enregistrée en base de données !'}
            </h2>
            <p style={{ color: '#6b7280' }}>Redirection vers la galerie des idées...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">{challengeId ? 'Titre de votre idée' : 'Titre'}</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                placeholder="Un titre clair et concis"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Catégorie</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Prévention">Prévention</option>
                <option value="Transparence">Transparence</option>
                <option value="Digital">Digital</option>
                <option value="Éducation">Éducation</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setError(''); }}
                placeholder="Contexte, problème, solution proposée, impact attendu..."
                required
              />
            </div>

            <div className="submit-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-cancel" disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="btn-submit-green" disabled={loading}>
                {loading ? 'Sauvegarde BDD...' : challengeId ? 'Soumettre ma participation' : "Publier l'idée"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
