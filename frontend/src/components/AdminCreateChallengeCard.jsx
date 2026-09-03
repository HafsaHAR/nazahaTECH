import { useState } from 'react';
import { createChallengeApi } from '../api/challengeApi';
import '../pages/SubmitIdea.css';
import './AdminCreateChallengeCard.css';

export default function AdminCreateChallengeCard({ onSuccess, onClose }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Digital');
  const [reward, setReward] = useState('50 000 MAD + accompagnement');
  const [duration, setDuration] = useState('4 semaines');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [organization, setOrganization] = useState('INPPLC');

  // Dates clés
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deadline, setDeadline] = useState('');

  // Mode de localisation
  const [locationMode, setLocationMode] = useState('remote');
  const [locationAddress, setLocationAddress] = useState('');

  // Champs dynamiques
  const [extraFields, setExtraFields] = useState([
    { title: 'Jury et Évaluation', content: 'Le jury sera composé d\'experts de l\'INPPLC et de partenaires.', order: 1 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryOptions = [
    { key: 'Prévention', label: 'Prévention & Sensibilisation', icon: '🛡️' },
    { key: 'Transparence', label: 'Transparence Administrative', icon: '📊' },
    { key: 'Digital', label: 'Digital & Intelligence Artificielle', icon: '💻' },
    { key: 'Éducation', label: 'Éducation & Jeunesse', icon: '🎓' }
  ];

  const handleAddExtraField = () => {
    setExtraFields([
      ...extraFields,
      { title: '', content: '', order: extraFields.length + 1 }
    ]);
  };

  const handleUpdateExtraField = (index, field, value) => {
    const updated = [...extraFields];
    updated[index][field] = value;
    setExtraFields(updated);
  };

  const handleRemoveExtraField = (index) => {
    setExtraFields(extraFields.filter((_, idx) => idx !== index));
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!title.trim() || title.trim().length < 3) {
        setError('Veuillez saisir un titre d\'au moins 3 caractères pour le défi.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!description.trim() || description.trim().length < 10) {
        setError('Veuillez fournir une description complète d\'au moins 10 caractères.');
        return;
      }
      if (!startDate || !endDate || !deadline) {
        setError('Veuillez renseigner toutes les dates (début, fin et date limite de candidature).');
        return;
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dead = new Date(deadline);

      if (end <= start) {
        setError('La date de fin doit être strictement postérieure à la date de début.');
        return;
      }
      if (dead > start) {
        setError('La date limite de candidature doit être antérieure ou égale au début du défi.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !startDate || !endDate || !deadline) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        reward: reward.trim(),
        duration: duration.trim(),
        maxParticipants: parseInt(maxParticipants, 10) || 100,
        organization: organization.trim(),
        startDate,
        endDate,
        deadline,
        locationMode,
        locationAddress: locationMode === 'onsite' ? locationAddress.trim() : 'À distance',
        extraFields: extraFields
          .filter((f) => f.title.trim() && f.content.trim())
          .map((f, idx) => ({ title: f.title.trim(), content: f.content.trim(), order: idx + 1 }))
      };

      await createChallengeApi(payload);
      setLoading(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Erreur création défi :', err);
      const msg = err.response?.data?.message || 'Erreur lors de la création du défi.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="submit-idea-page" style={{ marginBottom: '2.5rem' }}>
      {/* En-tête du Formulaire Administrateur */}
      <div className="submit-hero-card">
        <div className="hero-icon-circle">🛡️</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="hero-title">🛡️ Interface Administrateur — Créer un Défi INPPLC</h1>
            <button type="button" onClick={onClose} className="btn-close-form" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
              Fermer ✕
            </button>
          </div>
          <p className="hero-sub">
            Définissez les objectifs, les règles et la timeline d'un nouveau défi stratégique d'innovation INPPLC.
          </p>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Barre de Progression à 3 Étapes */}
      <div className="steps-progress-bar">
        <div className={`step-node ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
          <span className="node-num">1</span>
          <span className="node-text">Titre & Catégorie</span>
        </div>
        <div className="step-connector" />
        <div className={`step-node ${step >= 2 ? 'active' : ''}`} onClick={() => step > 1 && setStep(2)}>
          <span className="node-num">2</span>
          <span className="node-text">Description & Dates</span>
        </div>
        <div className="step-connector" />
        <div className={`step-node ${step >= 3 ? 'active' : ''}`} onClick={() => step > 2 && setStep(3)}>
          <span className="node-num">3</span>
          <span className="node-text">Modalités & Confirmation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="modern-form-card">
        {step === 1 && (
          <div className="step-content">
            <h3 className="step-heading">📌 Étape 1 : Titre et Thématique du Défi</h3>

            <div className="form-group-custom" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Titre du Défi *</label>
              <input
                type="text"
                required
                placeholder="Ex: Digitalisation des Marchés Publics Communaux"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input-lg"
              />
            </div>

            <div className="form-group-custom">
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Sélectionnez la catégorie principale *</label>
              <div className="category-selector-grid">
                {categoryOptions.map((cat) => (
                  <div
                    key={cat.key}
                    className={`category-select-card ${category === cat.key ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.key)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-text">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions-row">
              <button type="button" onClick={onClose} className="btn-cancel">
                Annuler
              </button>
              <button type="button" onClick={handleNextStep} className="btn-hero-primary">
                Étape Suivante : Description →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3 className="step-heading">📝 Étape 2 : Description complète et dates clés</h3>

            <div className="form-group-custom" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Description Complète *</label>
              <textarea
                required
                rows={5}
                placeholder="Décrivez les objectifs, le contexte et les résultats attendus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea-lg"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group-custom">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Récompense</label>
                <input
                  type="text"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="50 000 MAD + incubation"
                  className="form-input-lg"
                />
              </div>

              <div className="form-group-custom">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Durée</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="4 semaines"
                  className="form-input-lg"
                />
              </div>

              <div className="form-group-custom">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Max Participants</label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="100"
                  className="form-input-lg"
                />
              </div>
            </div>

            {/* Validation Stricte des Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group-custom">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Limite Candidature (Deadline) *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="form-input-lg"
                />
              </div>

              <div className="form-group-custom">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Date de Début *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input-lg"
                />
              </div>

              <div className="form-group-custom">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Date de Fin *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input-lg"
                />
              </div>
            </div>

            <div className="form-actions-row" style={{ marginTop: '2rem' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-cancel">
                ← Étape Précédente
              </button>
              <button type="button" onClick={handleNextStep} className="btn-hero-primary">
                Étape Suivante : Modalités →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3 className="step-heading">⚙️ Étape 3 : Modalités de présence & sections dynamiques</h3>

            <div style={{ display: 'grid', gridTemplateColumns: locationMode === 'onsite' ? '1fr 1fr' : '1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group-custom">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Mode de Présence</label>
                <select value={locationMode} onChange={(e) => setLocationMode(e.target.value)} className="form-input-lg">
                  <option value="remote">💻 À distance (Remote)</option>
                  <option value="onsite">📍 Présentiel (On-site)</option>
                </select>
              </div>

              {locationMode === 'onsite' && (
                <div className="form-group-custom">
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Adresse / Lieu Exact *</label>
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="Ex: Siège INPPLC, Hay Riad, Rabat"
                    className="form-input-lg"
                  />
                </div>
              )}
            </div>

            {/* Sections Dynamiques */}
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
                🧩 Sections Complémentaires Dynamiques (Jury, Phasing...)
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#6b7280', marginBottom: '1rem' }}>
                Ajoutez des blocs d'information personnalisés. Ils s'afficheront sur la fiche officielle du défi.
              </p>

              {extraFields.map((field, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '12px', padding: '1.15rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>Section #{idx + 1}</span>
                    <button type="button" onClick={() => handleRemoveExtraField(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                      ✕ Supprimer
                    </button>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.25rem' }}>Titre de la section</label>
                    <input
                      type="text"
                      placeholder="Ex: Jury et Évaluation"
                      value={field.title}
                      onChange={(e) => handleUpdateExtraField(idx, 'title', e.target.value)}
                      className="form-input-lg"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.25rem' }}>Contenu détaillé</label>
                    <textarea
                      rows={2}
                      placeholder="Description ou liste d'exigences..."
                      value={field.content}
                      onChange={(e) => handleUpdateExtraField(idx, 'content', e.target.value)}
                      className="form-textarea-lg"
                    />
                  </div>
                </div>
              ))}

              <button type="button" onClick={handleAddExtraField} className="btn-export-badge" style={{ marginTop: '0.5rem' }}>
                + Ajouter une section dynamique
              </button>
            </div>

            <div className="form-actions-row">
              <button type="button" onClick={() => setStep(2)} className="btn-cancel">
                ← Modifier la Description
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-hero-primary"
                style={{ padding: '0.85rem 2rem' }}
              >
                {loading ? '⏳ Création en BDD...' : '🚀 Publier le Défi dans la BDD'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
