import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createIdeaApi, uploadIdeaAttachmentApi } from '../api/ideaApi';
import './SubmitIdea.css';

export default function SubmitIdea() {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challenge');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prévention');
  const [description, setDescription] = useState('');

  // États pour les pièces jointes (Images & Fichiers)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const updated = [...selectedFiles];
    files.forEach((f) => {
      if (!updated.some((existing) => existing.name === f.name && existing.size === f.size)) {
        updated.push(f);
      }
    });
    setSelectedFiles(updated);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
      // 1. Téléverser chaque fichier joint sélectionné vers l'API
      const uploadedAttachments = [];
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress(`Téléversement des pièces jointes (${i + 1}/${selectedFiles.length})...`);
          const res = await uploadIdeaAttachmentApi(file);
          uploadedAttachments.push({
            fileName: res.fileName,
            fileUrl: res.fileUrl,
            fileSize: res.fileSize,
            extension: res.extension
          });
        }
      }

      setUploadProgress('Enregistrement de votre proposition...');

      // 2. Créer l'idée avec ses pièces jointes liées
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        challengeId: challengeId || null,
        attachments: uploadedAttachments
      };

      const response = await createIdeaApi(payload);
      console.log('✅ Idée et pièces jointes enregistrées en BDD :', response);

      setSubmitted(true);
      setTimeout(() => {
        if (challengeId) {
          navigate(`/challenges/${challengeId}`);
        } else {
          navigate('/ideas');
        }
      }, 1500);

    } catch (err) {
      console.error('❌ Erreur lors de la création de l\'idée :', err);

      if (err.response?.status === 401 || err.response?.data?.message?.includes('Non autorisé')) {
        setError('Votre session a expiré. Déconnexion automatique...');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } else {
        const msg = err.message || err.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde de votre idée.';
        setError(msg);
      }
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="submit-idea-container">
      {/* Header Dynamique */}
      {!challengeId ? (
        <div className="submit-header">
          <h1 className="submit-title">Soumettre une idée générale</h1>
          <p className="submit-sub">
            Décrivez clairement votre proposition citoyenne. Vous pouvez y joindre des images ou documents.
          </p>
        </div>
      ) : (
        <div className="submit-header">
          <h1 className="submit-title">Soumettre une idée pour ce Défi</h1>
          <p className="submit-sub">
            Votre proposition et ses pièces jointes seront transmises exclusivement à ce défi d'innovation.
          </p>
        </div>
      )}

      <div className="submit-idea-card">
        {challengeId && (
          <div className="challenge-reward-box">
            <div>
              <div className="reward-label">Récompense Officielle du Défi</div>
              <div className="reward-amount">50 000 MAD + accompagnement</div>
            </div>
            <button onClick={() => navigate(`/challenges/${challengeId}`)} className="btn-cancel" style={{ padding: '0.5rem 1rem' }}>
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
              {challengeId ? 'Participation et pièces jointes transmises avec succès !' : 'Idée et pièces jointes enregistrées !'}
            </h2>
            <p style={{ color: '#6b7280' }}>
              {challengeId ? 'Redirection vers la fiche du défi...' : 'Redirection vers la galerie des idées...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">{challengeId ? 'Titre de votre proposition pour le défi' : 'Titre'}</label>
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

            {/* Section Sélection de Pièces Jointes (Images & Documents) */}
            <div className="form-group">
              <label>📎 Pièces Jointes & Documents d'Illustration (Optionnel)</label>
              <p style={{ fontSize: '0.825rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Joignez des images (PNG, JPG), prototypes, rapports ou schémas explicatifs (PDF, DOCX, XLSX).
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label className="btn-cancel" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: 0, padding: '0.6rem 1.2rem' }}>
                  <span>📷 / 📄 Choisir des fichiers</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.gif"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {selectedFiles.length > 0 ? `${selectedFiles.length} fichier(s) sélectionné(s)` : 'Aucun fichier choisi'}
                </span>
              </div>

              {/* Liste des fichiers sélectionnés */}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{file.name}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.775rem' }}>
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }}
                        title="Supprimer la pièce jointe"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="alert-success" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div className="submit-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-cancel" disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="btn-submit-green" disabled={loading}>
                {loading ? 'Sauvegarde BDD...' : challengeId ? 'Soumettre au Défi' : "Publier l'idée"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
