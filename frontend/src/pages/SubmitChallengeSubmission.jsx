import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getChallengeByIdApi } from '../api/challengeApi';
import { createChallengeSubmissionApi } from '../api/challengeSubmissionApi';
import { uploadIdeaAttachmentApi } from '../api/ideaApi';
import './SubmitIdea.css';

export default function SubmitChallengeSubmission() {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challengeId');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { translateText } = useLanguage();

  const [challenge, setChallenge] = useState(null);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Pièces jointes
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (challengeId) {
      fetchChallengeDetails();
    }
  }, [challengeId]);

  const fetchChallengeDetails = async () => {
    try {
      const data = await getChallengeByIdApi(challengeId);
      if (data && data.challenge) {
        setChallenge(data.challenge);
      }
    } catch (err) {
      console.error('Erreur chargement détails défi :', err);
    }
  };

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

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!title.trim() || title.trim().length < 3) {
        setError('Veuillez saisir un titre d\'au moins 3 caractères pour votre solution.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!description.trim() || description.trim().length < 10) {
        setError('Veuillez détailler votre proposition d\'au moins 10 caractères.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!challengeId) {
      setError('Aucun défi sélectionné.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Veuillez remplir le titre et la description de votre solution.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadedAttachments = [];

      if (selectedFiles.length > 0) {
        setUploadProgress(`⏳ Téléversement de ${selectedFiles.length} fichier(s)...`);

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress(`⏳ Téléversement (${i + 1}/${selectedFiles.length}) : ${file.name}...`);
          const uploadRes = await uploadIdeaAttachmentApi(file);
          if (uploadRes && uploadRes.fileUrl) {
            uploadedAttachments.push({
              fileName: uploadRes.fileName || file.name,
              fileUrl: uploadRes.fileUrl,
              fileSize: uploadRes.fileSize || `${(file.size / 1024).toFixed(0)} KB`,
              extension: uploadRes.extension || file.name.split('.').pop().toUpperCase()
            });
          }
        }
      }

      setUploadProgress('⏳ Enregistrement de votre soumission au défi dans la BDD...');

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: challenge?.category || 'Général',
        attachments: uploadedAttachments
      };

      await createChallengeSubmissionApi(challengeId, payload);

      setSubmitted(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (err) {
      console.error('❌ Erreur soumission défi :', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Déconnexion...');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } else {
        setError(err.message || err.response?.data?.message || 'Erreur lors de la sauvegarde.');
      }
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="submit-idea-page">
      {/* Carte d'en-tête dédiée à la participation au défi */}
      <div className="submit-hero-card challenge-hero-card">
        <div className="hero-icon-circle" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>🏆</div>
        <div>
          <span className="challenge-tag-badge">{challenge?.category ? translateText(challenge.category) : 'Défi INPPLC'}</span>
          <h1 className="hero-title">
            🎯 Soumission de Solution : {challenge ? translateText(challenge.title) : 'Défi INPPLC'}
          </h1>
          <p className="hero-sub">
            {challenge ? translateText(challenge.description) : 'Proposez votre solution d\'innovation pour répondre aux objectifs de ce défi stratégique.'}
          </p>
        </div>
      </div>

      {submitted && (
        <div className="alert-success" style={{ padding: '1.25rem', fontSize: '1rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem' }}>
          🎉 Félicitations ! Votre soumission au défi a été enregistrée en BDD. Redirection vers votre profil...
        </div>
      )}

      {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Stepper de progression dédié au candidat */}
      <div className="steps-progress-bar">
        <div className={`step-node ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
          <span className="node-num">1</span>
          <span className="node-text">Titre de la Solution</span>
        </div>
        <div className="step-connector" />
        <div className={`step-node ${step >= 2 ? 'active' : ''}`} onClick={() => step > 1 && setStep(2)}>
          <span className="node-num">2</span>
          <span className="node-text">Détails de la Proposition</span>
        </div>
        <div className="step-connector" />
        <div className={`step-node ${step >= 3 ? 'active' : ''}`} onClick={() => step > 2 && setStep(3)}>
          <span className="node-num">3</span>
          <span className="node-text">Fichiers & Confirmation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="modern-form-card">
        {step === 1 && (
          <div className="step-content">
            <h3 className="step-heading">📌 Étape 1 : Titre de votre projet / solution</h3>

            <div className="form-group-custom">
              <label>Titre de votre proposition pour ce défi *</label>
              <input
                type="text"
                required
                placeholder="Ex: Système automatisé de contrôle des marchés par IA..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input-lg"
              />
            </div>

            <div className="form-actions-row">
              <button type="button" onClick={() => navigate('/challenges')} className="btn-cancel">
                Annuler
              </button>
              <button type="button" onClick={handleNextStep} className="btn-hero-primary">
                Étape Suivante : Détails →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3 className="step-heading">📝 Étape 2 : Description détaillée de la solution</h3>

            <div className="form-group-custom">
              <label>Description technique et organisationnelle de votre solution *</label>
              <textarea
                required
                rows={8}
                placeholder="Décrivez votre méthodologie, les technologies utilisées, les étapes de mise en œuvre et la réponse apportée au besoin du défi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea-lg"
              />
            </div>

            <div className="form-actions-row">
              <button type="button" onClick={() => setStep(1)} className="btn-cancel">
                ← Étape Précédente
              </button>
              <button type="button" onClick={handleNextStep} className="btn-hero-primary">
                Étape Suivante : Fichiers →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3 className="step-heading">📎 Étape 3 : Spécifications & Fichiers joints</h3>

            <div className="form-group-custom">
              <label>Ajouter des prototypes, schémas ou présentations (Optionnel)</label>
              <div className="drag-upload-box">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.docx,.doc,.xlsx,.xls"
                  onChange={handleFileSelect}
                  id="challenge-sub-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="challenge-sub-file-input" className="upload-dropzone-label">
                  <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</span>
                  <strong>Cliquez pour téléverser vos livrables</strong>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Formats acceptés : PDF, DOCX, XLSX, PNG, JPG</span>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="files-list-preview">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="file-item-pill">
                      <span>📄 {file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                      <button type="button" onClick={() => handleRemoveFile(idx)} className="btn-remove-file">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="summary-preview-box">
              <h4>Récapitulatif de votre soumission au Défi :</h4>
              <p><strong>Défi :</strong> {challenge?.title}</p>
              <p><strong>Titre Solution :</strong> {title}</p>
              <p><strong>Description :</strong> {description.substring(0, 150)}...</p>
            </div>

            {uploadProgress && (
              <div className="alert-info" style={{ padding: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
                {uploadProgress}
              </div>
            )}

            <div className="form-actions-row">
              <button type="button" onClick={() => setStep(2)} className="btn-cancel">
                ← Modifier les Détails
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-hero-primary"
                style={{ padding: '0.85rem 2rem' }}
              >
                {loading ? '⏳ Soumission en cours...' : '🚀 Soumettre ma Solution au Défi'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
