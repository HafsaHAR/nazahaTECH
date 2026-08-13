import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitiativesApi, createInitiativeApi, deleteInitiativeApi } from '../api/initiativeApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Initiatives.css';
import './Challenges.css';
import './Dashboard.css';

export default function Initiatives() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('Tous');
  const [country, setCountry] = useState('Tous');
  const [maturityLevel, setMaturityLevel] = useState('Tous');

  // État formulaire d'ajout Admin
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newCountry, setNewCountry] = useState('Maroc');
  const [newCity, setNewCity] = useState('Rabat');
  const [newDomain, setNewDomain] = useState('Digital');
  const [newDesc, setNewDesc] = useState('');
  const [newMaturity, setNewMaturity] = useState('Deployed');
  const [newActorType, setNewActorType] = useState('Public');
  const [newYear, setNewYear] = useState(2025);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactWebsite, setNewContactWebsite] = useState('');
  const [newTagsStr, setNewTagsStr] = useState('Digital, Transparence');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const domainOptions = ['Tous', 'Digital', 'Audit', 'Éducation', 'Control', 'Citizen Participation', 'Transparence'];
  const maturityOptions = ['Tous', 'Deployed', 'POC', 'Idea'];
  const countryOptions = ['Tous', 'Maroc', 'International'];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInitiatives();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, domain, country, maturityLevel]);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const data = await getInitiativesApi({ search, domain, country, maturityLevel });
      setInitiatives(data.initiatives || []);
    } catch (err) {
      console.error('Erreur chargement annuaire initiatives :', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInitiative = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim() || !newDesc.trim()) return;

    try {
      setSubmitting(true);
      setMsg('');
      const tagsArray = newTagsStr.split(',').map((t) => t.trim()).filter(Boolean);

      await createInitiativeApi({
        title: newTitle.trim(),
        organization: newOrg.trim(),
        country: newCountry,
        city: newCity.trim() || 'Rabat',
        domain: newDomain,
        description: newDesc.trim(),
        maturityLevel: newMaturity,
        actorType: newActorType,
        year: Number(newYear) || 2025,
        contactEmail: newContactEmail.trim() || 'contact@inpplc.ma',
        contactWebsite: newContactWebsite.trim() || 'https://inpplc.ma',
        tags: tagsArray
      });

      setMsg('✅ Initiative ajoutée à l\'Annuaire avec succès !');
      setShowAddForm(false);
      setNewTitle('');
      setNewOrg('');
      setNewDesc('');
      fetchInitiatives();
    } catch (err) {
      setMsg('❌ Erreur lors de l\'ajout de l\'initiative.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInitiative = async (e, id, title) => {
    e.stopPropagation();
    if (!window.confirm(`Voulez-vous vraiment supprimer l'initiative "${title}" ?`)) return;

    try {
      await deleteInitiativeApi(id);
      fetchInitiatives();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const getMaturityLabel = (mat) => {
    if (mat === 'Deployed') return '🟢 Déployé';
    if (mat === 'POC') return '🟠 POC / Prototype';
    return '💡 Idée';
  };

  return (
    <div className="initiatives-container">
      {/* En-tête de l'Annuaire */}
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.85rem' }}>
            📋 Annuaire des Initiatives Innovantes
          </h1>
          <p className="section-subtitle">
            Découvrez le répertoire public des projets et initiatives d'innovation de probité et de lutte contre la corruption au Maroc et dans le monde.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-hero-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            {showAddForm ? '✕ Fermer' : '+ Ajouter une Initiative'}
          </button>
        )}
      </div>

      {msg && <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#15803d' : '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>{msg}</div>}

      {/* Formulaire d'ajout Admin */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleAddInitiative} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary-green)' }}>
            ➕ Ajout d'une Nouvelle Initiative dans l'Annuaire
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Titre de l'initiative *</label>
              <input
                type="text"
                required
                placeholder="Ex: Chikaya.ma..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Organisation / Acteur *</label>
              <input
                type="text"
                required
                placeholder="Ex: Ministère de la Transition Numérique..."
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Maturité</label>
              <select
                value={newMaturity}
                onChange={(e) => setNewMaturity(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              >
                <option value="Deployed">Deployed (Déployé)</option>
                <option value="POC">POC (Prototype)</option>
                <option value="Idea">Idea (Idée)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Domaine</label>
              <select
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              >
                <option value="Digital">Digital</option>
                <option value="Audit">Audit</option>
                <option value="Éducation">Éducation</option>
                <option value="Control">Control</option>
                <option value="Citizen Participation">Citizen Participation</option>
                <option value="Transparence">Transparence</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Type d'Acteur</label>
              <select
                value={newActorType}
                onChange={(e) => setNewActorType(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              >
                <option value="Public">Public</option>
                <option value="ONG">ONG</option>
                <option value="Startup">Startup</option>
                <option value="Académie">Académie</option>
                <option value="International">International</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Pays / Ville</label>
              <input
                type="text"
                placeholder="Rabat, Maroc"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Année</label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Description détaillée *</label>
            <textarea
              required
              rows={3}
              placeholder="Description des objectifs, du périmètre et de l'impact..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Email de contact</label>
              <input
                type="email"
                placeholder="contact@initiative.ma"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Site Web Officiel</label>
              <input
                type="text"
                placeholder="https://..."
                value={newContactWebsite}
                onChange={(e) => setNewContactWebsite(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Tags (séparés par virgule)</label>
              <input
                type="text"
                placeholder="Digital, Audit, Transparence"
                value={newTagsStr}
                onChange={(e) => setNewTagsStr(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-hero-primary" style={{ padding: '0.65rem 1.5rem' }}>
            {submitting ? 'Enregistrement...' : 'Publier l\'Initiative'}
          </button>
        </form>
      )}

      {/* Barre de filtrage & recherche */}
      <div className="challenges-filter-panel">
        <div className="controls-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem' }}>
          <div className="challenge-search-box">
            <span className="challenge-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher une initiative, organisation ou mot-clé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-control"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            {domainOptions.map((d) => (
              <option key={d} value={d}>
                Domaine: {d}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={maturityLevel}
            onChange={(e) => setMaturityLevel(e.target.value)}
          >
            {maturityOptions.map((m) => (
              <option key={m} value={m}>
                Maturité: {m === 'Tous' ? 'Toutes' : getMaturityLabel(m)}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countryOptions.map((c) => (
              <option key={c} value={c}>
                Pays: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des initiatives */}
      {loading ? (
        <div className="initiatives-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : initiatives.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Aucune initiative ne correspond à vos critères
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Essayez de réinitialiser vos filtres de recherche.
          </p>
          <button
            onClick={() => { setSearch(''); setDomain('Tous'); setCountry('Tous'); setMaturityLevel('Tous'); }}
            className="btn-hero-primary"
            style={{ margin: '0 auto', textDecoration: 'none' }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="initiatives-grid">
          {initiatives.map((init) => (
            <div
              key={init._id}
              className="initiative-card"
              onClick={() => navigate(`/initiatives/${init._id}`)}
              title="Cliquer pour voir la fiche détaillée de l'initiative"
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className={`maturity-badge ${init.maturityLevel}`}>
                    {getMaturityLabel(init.maturityLevel)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                      📍 {init.city}, {init.country}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteInitiative(e, init._id, init.title)}
                        style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        title="Supprimer l'initiative"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="idea-title" style={{ fontSize: '1.15rem' }}>{init.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {init.organization}
                </p>
                <p className="idea-desc">{init.description}</p>
              </div>

              <div className="idea-footer" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div className="initiative-tags-group">
                  {init.tags?.map((tag) => (
                    <span key={tag} className="initiative-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
