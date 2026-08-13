import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getInitiativeByIdApi, updateInitiativeApi, deleteInitiativeApi } from '../api/initiativeApi';
import { useAuth } from '../context/AuthContext';
import './Initiatives.css';
import './Dashboard.css';

export default function InitiativeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mode Édition Admin
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editOrg, setEditOrg] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMaturity, setEditMaturity] = useState('Deployed');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getInitiativeByIdApi(id);
      setInitiative(data.initiative);
      if (data.initiative) {
        setEditTitle(data.initiative.title);
        setEditOrg(data.initiative.organization);
        setEditDesc(data.initiative.description);
        setEditMaturity(data.initiative.maturityLevel);
      }
    } catch (err) {
      console.error('Erreur détails initiative :', err);
      setError('Impossible de charger la fiche de cette initiative.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg('');
      const updated = await updateInitiativeApi(id, {
        title: editTitle,
        organization: editOrg,
        description: editDesc,
        maturityLevel: editMaturity
      });
      setInitiative(updated.initiative);
      setIsEditing(false);
      setMsg('✅ Initiative mise à jour avec succès.');
    } catch (err) {
      setMsg('❌ Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'initiative "${initiative.title}" ?`)) return;

    try {
      await deleteInitiativeApi(id);
      navigate('/initiatives');
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const getMaturityLabel = (mat) => {
    if (mat === 'Deployed') return '🟢 Déployé & Opérationnel';
    if (mat === 'POC') return '🟠 Prototype / POC en Validation';
    return '💡 Concept & Idée Initiale';
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Chargement de l'initiative...</div>;
  if (error || !initiative) return <div style={{ padding: '3rem', color: '#ef4444' }}>{error || 'Initiative introuvable'}</div>;

  return (
    <div className="initiatives-container" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/initiatives" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>
          ← Retour à l'Annuaire des initiatives
        </Link>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-hero-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {isEditing ? '✕ Annuler' : '✏️ Modifier'}
            </button>
            <button
              onClick={handleDelete}
              style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              🗑️ Supprimer
            </button>
          </div>
        )}
      </div>

      {msg && <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#15803d' : '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>{msg}</div>}

      {/* Formulaire de modification Admin */}
      {isAdmin && isEditing ? (
        <form onSubmit={handleUpdate} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary-green)' }}>
            ✏️ Modification de l'Initiative (Mode Admin)
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Titre *</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Organisation *</label>
              <input
                type="text"
                required
                value={editOrg}
                onChange={(e) => setEditOrg(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Maturité</label>
              <select
                value={editMaturity}
                onChange={(e) => setEditMaturity(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              >
                <option value="Deployed">Deployed</option>
                <option value="POC">POC</option>
                <option value="Idea">Idea</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Description *</label>
            <textarea
              required
              rows={4}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <button type="submit" disabled={saving} className="btn-hero-primary" style={{ padding: '0.65rem 1.5rem' }}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '2.25rem', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className={`maturity-badge ${initiative.maturityLevel}`}>
              {getMaturityLabel(initiative.maturityLevel)}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
              📍 {initiative.city}, {initiative.country} ({initiative.year})
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
            {initiative.title}
          </h1>

          <div style={{ fontSize: '1rem', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '1.5rem' }}>
            Porteur : {initiative.organization} ({initiative.actorType})
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
              Description & Périmètre de l'Initiative
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
              {initiative.description}
            </p>
          </div>

          {/* Preuves d'impact & Liens */}
          {initiative.impactEvidence && initiative.impactEvidence.length > 0 && (
            <div style={{ marginBottom: '1.75rem', padding: '1.25rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.75rem' }}>
                📊 Preuves d'Impact & Documents Associés
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {initiative.impactEvidence.map((ev, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>
                    <a href={ev.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>
                      🔗 {ev.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact & Tags */}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="initiative-tags-group">
              {initiative.tags?.map((tag) => (
                <span key={tag} className="initiative-tag">
                  #{tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              {initiative.contactEmail && (
                <a href={`mailto:${initiative.contactEmail}`} style={{ color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>
                  ✉️ {initiative.contactEmail}
                </a>
              )}
              {initiative.contactWebsite && (
                <a href={initiative.contactWebsite} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>
                  🌐 Site Officiel
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
