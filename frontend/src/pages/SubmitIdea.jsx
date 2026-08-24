import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createIdeaApi, uploadIdeaAttachmentApi } from '../api/ideaApi';
import './SubmitIdea.css';

export default function SubmitIdea() {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challenge');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

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
      setError('Veuillez remplir le titre et la description de votre idée.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadedAttachments = [];

      // Étape 1 : Upload physique des fichiers s'il y en a
      if (selectedFiles.length > 0) {
        setUploadProgress(`⏳ Téléversement de ${selectedFiles.length} fichier(s)...`);

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress(`⏳ Téléversement du fichier (${i + 1}/${selectedFiles.length}) : ${file.name}...`);
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

      setUploadProgress('⏳ Publication de votre proposition...');

      // Étape 2 : Création de l'idée en BDD
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        attachments: uploadedAttachments
      };

      if (challengeId) {
        payload.challengeId = challengeId;
      }

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
      {/* Header Dynamique Traduit */}
      {!challengeId ? (
        <div className="submit-header">
          <h1 className="submit-title">{t('submit.title')}</h1>
          <p className="submit-sub">
            {t('submit.sub')}
          </p>
        </div>
      ) : (
        <div className="submit-header">
          <h1 className="submit-title">{t('submit.title')} (Défi)</h1>
          <p className="submit-sub">
            {t('submit.sub')}
          </p>
        </div>
      )}

      {submitted && (
        <div className="alert-success" style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1rem', fontWeight: 800 }}>
          🎉 Félicitations ! Votre proposition a été enregistrée avec succès. Redirection...
        </div>
      )}

      {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="submit-form-card">
        {/* Titre */}
        <div className="form-group-custom">
          <label>{t('submit.form_title')}</label>
          <input
            type="text"
            required
            placeholder="Ex: Système d'alerte anonyme sur les marchés publics..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Catégorie */}
        <div className="form-group-custom">
          <label>{t('submit.form_category')}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Prévention">Prévention & Sensibilisation</option>
            <option value="Transparence">Transparence Administrative</option>
            <option value="Digital">Digital & IA</option>
            <option value="Éducation">Éducation & Jeunesse</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group-custom">
          <label>{t('submit.form_desc')}</label>
          <textarea
            required
            rows={6}
            placeholder="Expliquez en détail le fonctionnement de votre proposition, le problème identifié et les bénéfices attendus..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Section Pièces Jointes */}
        <div className="form-group-custom">
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📎 {t('submit.form_files')}</span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>JPG, PNG, PDF, DOCX, XLSX</span>
          </label>

          <div style={{ padding: '1.25rem', border: '2px dashed #d1d5db', borderRadius: '12px', backgroundColor: '#f9fafb', textAlign: 'center', marginTop: '0.35rem' }}>
            <label style={{ display: 'inline-block', padding: '0.6rem 1.25rem', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', color: 'var(--primary-green)' }}>
              📁 Parcourir mes fichiers...
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.docx,.doc,.xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#111827' }}>
                    <span>{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                    <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem' }}
                    title="Retirer ce fichier"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {uploadProgress && (
          <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>
            {uploadProgress}
          </div>
        )}

        {/* Boutons d'Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancel"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            {t('action.close')}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-hero-primary"
            style={{ padding: '0.75rem 1.75rem' }}
          >
            {loading ? '⏳ Traitement...' : t('submit.btn_submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
