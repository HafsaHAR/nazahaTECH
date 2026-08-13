import { useState, useEffect } from 'react';
import { getDocumentsApi, uploadDocumentFileApi, createDocumentApi, deleteDocumentApi } from '../api/documentApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Library.css';
import './Challenges.css';

export default function Library() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Toutes');

  // État formulaire d'ajout Admin
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null); // { fileName, fileSize, extension }

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('Guides');
  const [newSource, setNewSource] = useState('INPPLC Maroc');

  // État d'avancement du téléversement (Multi-stage state)
  // 'IDLE' | 'UPLOADING_FILE' | 'SAVING_DOCUMENT' | 'SUCCESS' | 'ERROR'
  const [uploadState, setUploadState] = useState('IDLE');
  const [msg, setMsg] = useState('');

  const typeOptions = ['Toutes', 'Lois', 'Guides', 'Rapports', 'Normes', 'Modèles'];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, type]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await getDocumentsApi({ search, type });
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Erreur chargement bibliothèque :', err);
    } finally {
      setLoading(false);
    }
  };

  // Sélection locale du fichier par l'Admin
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const bytes = file.size;
    const formattedSize = bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

    const nameParts = file.name.split('.');
    const ext = nameParts.pop().toUpperCase();
    const normalizedExt = ext === 'DOCX' || ext === 'DOC' ? 'DOCX' : ext === 'XLSX' || ext === 'XLS' ? 'XLSX' : 'PDF';

    setSelectedFile(file);
    setFileMeta({
      fileName: file.name,
      fileSize: formattedSize,
      extension: normalizedExt
    });

    // Pré-remplir automatiquement le titre si vide
    if (!newTitle.trim()) {
      const cleanTitle = nameParts.join('.').replace(/[-_]/g, ' ');
      setNewTitle(cleanTitle);
    }
  };

  // Soumission et téléversement multi-étapes
  const handlePublishDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier sur votre ordinateur.');
      return;
    }
    if (!newTitle.trim() || !newDesc.trim()) return;

    try {
      setMsg('');
      setUploadState('UPLOADING_FILE');

      // Étape 1 : Téléversement du fichier physique vers backend/uploads/documents/
      const uploadRes = await uploadDocumentFileApi(selectedFile);

      setUploadState('SAVING_DOCUMENT');

      // Étape 2 : Publication du document en base avec l'URL du fichier retournée
      await createDocumentApi({
        title: newTitle.trim(),
        description: newDesc.trim(),
        type: newType,
        fileUrl: uploadRes.fileUrl,
        fileSize: uploadRes.fileSize || fileMeta.fileSize,
        extension: uploadRes.extension || fileMeta.extension,
        source: newSource.trim() || 'INPPLC Maroc',
        accessLevel: 'PUBLIC'
      });

      setUploadState('SUCCESS');
      setMsg('✅ Fichier téléversé et document publié dans la Bibliothèque avec succès !');

      // Réinitialisation
      setSelectedFile(null);
      setFileMeta(null);
      setNewTitle('');
      setNewDesc('');
      setShowAddForm(false);
      fetchDocs();
    } catch (err) {
      console.error('Erreur téléversement :', err);
      setUploadState('ERROR');
      setMsg(`❌ Erreur : ${err.message || 'Échec du téléversement.'}`);
    }
  };

  const handleDeleteDocument = async (id, title) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le document "${title}" ?`)) return;

    try {
      await deleteDocumentApi(id);
      fetchDocs();
    } catch (err) {
      alert('Erreur lors de la suppression du document.');
    }
  };

  return (
    <div className="library-container">
      {/* En-tête de la Bibliothèque */}
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.85rem' }}>
            📚 Bibliothèque & Base Documentaire INPPLC
          </h1>
          <p className="section-subtitle">
            Consultez et téléchargez les textes juridiques, guides méthodologiques, normes et rapports de prévention contre la corruption.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setUploadState('IDLE'); }}
            className="btn-hero-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            {showAddForm ? '✕ Fermer' : '+ Ajouter un Document'}
          </button>
        )}
      </div>

      {msg && <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#15803d' : '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>{msg}</div>}

      {/* Formulaire d'ajout Admin avec Téléversement Local */}
      {isAdmin && showAddForm && (
        <form onSubmit={handlePublishDocument} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary-green)' }}>
            📤 Téléversement & Publication d'un Document (Mode Admin)
          </h3>

          {/* Sélecteur de fichier local */}
          <div style={{ marginBottom: '1.25rem', padding: '1.25rem', border: '2px dashed #d1d5db', borderRadius: '12px', backgroundColor: '#f9fafb', textAlign: 'center' }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '0.5rem', cursor: 'pointer' }}>
              📁 Sélectionnez un fichier sur votre ordinateur (PDF, DOCX, XLSX) *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.docx,.doc,.xlsx,.xls,.ppt,.pptx"
              onChange={handleFileSelect}
              style={{ margin: '0 auto', fontSize: '0.875rem' }}
            />

            {fileMeta && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', display: 'inline-block', fontSize: '0.85rem', fontWeight: 700 }}>
                📄 Fichier prêt : <strong>{fileMeta.fileName}</strong> ({fileMeta.fileSize} • Format {fileMeta.extension})
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Titre du document *</label>
              <input
                type="text"
                required
                placeholder="Titre officiel du document..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Thématique / Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              >
                <option value="Lois">Lois & Décrets</option>
                <option value="Guides">Guides & Procédures</option>
                <option value="Rapports">Rapports & Études</option>
                <option value="Normes">Normes & Standards</option>
                <option value="Modèles">Modèles & FAQ</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Description du document *</label>
            <textarea
              required
              rows={3}
              placeholder="Résumé explicatif du document..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Source / Émetteur</label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          {/* État d'avancement du Téléversement */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="submit"
              disabled={uploadState === 'UPLOADING_FILE' || uploadState === 'SAVING_DOCUMENT'}
              className="btn-hero-primary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
            >
              {uploadState === 'UPLOADING_FILE'
                ? '⏳ 1/2 Téléversement du fichier...'
                : uploadState === 'SAVING_DOCUMENT'
                ? '⏳ 2/2 Publication...'
                : 'Publier dans la Bibliothèque'}
            </button>

            {uploadState !== 'IDLE' && uploadState !== 'SUCCESS' && uploadState !== 'ERROR' && (
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                Sélectionner un fichier ➔ Upload ➔ Publication
              </span>
            )}
          </div>
        </form>
      )}

      {/* Barre de filtrage & recherche */}
      <div className="library-filter-panel">
        <div className="doc-type-pills-row">
          {typeOptions.map((tOpt) => (
            <button
              key={tOpt}
              className={`doc-pill ${type === tOpt ? 'active' : ''}`}
              onClick={() => setType(tOpt)}
            >
              {tOpt === 'Toutes' ? 'Tous les documents' : tOpt}
            </button>
          ))}
        </div>

        <div className="controls-row">
          <div className="challenge-search-box" style={{ width: '100%', maxWidth: '100%' }}>
            <span className="challenge-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par mot-clé (ex: Loi 46-19, ISO 37001, Marchés publics)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grille des documents */}
      {loading ? (
        <div className="docs-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : documents.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Aucun document ne correspond à votre recherche
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Modifiez vos mots-clés ou réinitialisez le filtre par type de document.
          </p>
          <button
            onClick={() => { setSearch(''); setType('Toutes'); }}
            className="btn-download-doc"
            style={{ margin: '0 auto' }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="docs-grid">
          {documents.map((doc) => (
            <div key={doc._id} className="doc-card">
              <div>
                <div className="doc-header-row">
                  <span className={`doc-ext-badge ${doc.extension?.toLowerCase() === 'docx' ? 'docx' : 'pdf'}`}>
                    {doc.extension || 'PDF'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-green)', backgroundColor: 'var(--primary-green-light)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                    {doc.accessLevel || 'PUBLIC'}
                  </span>
                </div>
                <h3 className="doc-title">{doc.title}</h3>
                <p className="doc-desc">{doc.description}</p>
              </div>

              <div className="doc-footer">
                <div>
                  <div>Source : <strong>{doc.source}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Taille : {doc.fileSize} • Publié le {new Date(doc.publicationDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-download-doc"
                    download
                  >
                    📥 Télécharger
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteDocument(doc._id, doc.title)}
                      style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.55rem 0.75rem', cursor: 'pointer', fontWeight: 700 }}
                      title="Supprimer le document"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
