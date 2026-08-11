import { useState } from 'react';
import { createChallengeApi } from '../api/challengeApi';
import './AdminCreateChallengeCard.css';

export default function AdminCreateChallengeCard({ onSuccess, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Digital');
  const [reward, setReward] = useState('50 000 MAD + accompagnement');
  const [duration, setDuration] = useState('4 semaines');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [organization, setOrganization] = useState('INPPLC');

  // Dates clés avec règles de validation backend
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deadline, setDeadline] = useState('');

  // Mode de localisation
  const [locationMode, setLocationMode] = useState('remote');
  const [locationAddress, setLocationAddress] = useState('');

  // Champs dynamiques (extraFields: title, content, order)
  const [extraFields, setExtraFields] = useState([
    { title: 'Jury et Évaluation', content: 'Le jury sera composé d\'experts de l\'INPPLC et du Ministère.', order: 1 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !startDate || !endDate || !deadline) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Validation stricte des dates côté client
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
    <div className="admin-challenge-form-card">
      <div className="admin-form-header">
        <h2 className="admin-form-title">🛡️ Interface Administrateur — Créer un Défi INPPLC</h2>
        <button type="button" onClick={onClose} className="btn-close-form">
          Fermer ✕
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ch-title">Titre du Défi *</label>
          <input
            type="text"
            id="ch-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Digitalisation des Marchés Publics Communaux"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ch-desc">Description Complète *</label>
          <textarea
            id="ch-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez les objectifs, le contexte et les résultats attendus..."
            required
          />
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label>Catégorie *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Digital">Digital</option>
              <option value="Prévention">Prévention</option>
              <option value="Transparence">Transparence</option>
              <option value="Éducation">Éducation</option>
            </select>
          </div>

          <div className="form-group">
            <label>Récompense</label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="50 000 MAD + incubation"
            />
          </div>

          <div className="form-group">
            <label>Durée</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="4 semaines"
            />
          </div>
        </div>

        {/* Validation Stricte des Dates */}
        <div className="form-grid-3">
          <div className="form-group">
            <label>Limite Candidature (Deadline) *</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de Début *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de Fin *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Mode de Localisation */}
        <div className="form-grid-2">
          <div className="form-group">
            <label>Mode de Présence</label>
            <select value={locationMode} onChange={(e) => setLocationMode(e.target.value)}>
              <option value="remote">💻 À distance (Remote)</option>
              <option value="onsite">📍 Présentiel (On-site)</option>
            </select>
          </div>

          {locationMode === 'onsite' && (
            <div className="form-group">
              <label>Adresse / Lieu Exact *</label>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Ex: Siège INPPLC, Hay Riad, Rabat"
                required
              />
            </div>
          )}
        </div>

        {/* Champs Dynamiques (extraFields) */}
        <div className="extra-fields-section">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
            🧩 Sections Complémentaires Dynamiques (Jury, Objectifs, Phasing...)
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            Ajoutez des blocs d'information personnalisés. Ils s'afficheront dynamiquement sur la fiche du défi.
          </p>

          {extraFields.map((field, idx) => (
            <div key={idx} className="extra-field-card">
              <button type="button" onClick={() => handleRemoveExtraField(idx)} className="btn-remove-extra">
                ✕ Supprimer
              </button>
              <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                <label>Titre de la section (ex: Jury, Objectifs)</label>
                <input
                  type="text"
                  value={field.title}
                  onChange={(e) => handleUpdateExtraField(idx, 'title', e.target.value)}
                  placeholder="Titre de la section"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Contenu détaillé</label>
                <textarea
                  rows={2}
                  value={field.content}
                  onChange={(e) => handleUpdateExtraField(idx, 'content', e.target.value)}
                  placeholder="Description ou liste d'exigences..."
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={handleAddExtraField} className="btn-add-extra">
            + Ajouter une section dynamique
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
            Annuler
          </button>
          <button type="submit" className="btn-submit-green" disabled={loading}>
            {loading ? 'Création en BDD...' : 'Publier le Défi'}
          </button>
        </div>
      </form>
    </div>
  );
}
