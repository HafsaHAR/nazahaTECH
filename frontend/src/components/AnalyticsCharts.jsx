import { useLanguage } from '../context/LanguageContext';
import './AnalyticsCharts.css';

export default function AnalyticsCharts({ ideas = [], metrics = null }) {
  const { lang, t, translateText } = useLanguage();

  // 1. Calcul de la répartition par catégorie
  const categoryCounts = {
    Prévention: 0,
    Transparence: 0,
    Digital: 0,
    Éducation: 0,
    Général: 0
  };

  ideas.forEach((idea) => {
    const cat = idea.category || 'Général';
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    } else {
      categoryCounts['Général']++;
    }
  });

  const totalIdeas = ideas.length || 1;
  const categoryColors = {
    Prévention: '#00563B',
    Transparence: '#0284c7',
    Digital: '#7c3aed',
    Éducation: '#d97706',
    Général: '#6b7280'
  };

  // 2. Calcul des statuts pour le Donut Chart
  const approvedCount = ideas.filter((i) => i.status === 'approved').length;
  const pendingCount = ideas.filter((i) => i.status === 'pending').length;
  const rejectedCount = metrics?.statusCounts?.rejected || 0;
  const totalStatus = approvedCount + pendingCount + rejectedCount || 1;

  const approvedPct = Math.round((approvedCount / totalStatus) * 100);
  const pendingPct = Math.round((pendingCount / totalStatus) * 100);
  const rejectedPct = Math.round((rejectedCount / totalStatus) * 100);

  // 3. Tendance mensuelle fictive / simulée basée sur la BDD
  const monthlyData = [
    { month: 'Mai', count: 4 },
    { month: 'Juin', count: 8 },
    { month: 'Juil', count: 14 },
    { month: 'Août', count: Math.max(ideas.length, 18) }
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.count), 20);

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h2 className="analytics-title">
          📊 {translateText('Analytique & Statistiques d\'Impact INPPLC')}
        </h2>
        <p className="analytics-sub">
          {translateText('Visualisation en temps réel de la participation citoyenne et des taux d\'approbation.')}
        </p>
      </div>

      <div className="charts-grid">
        {/* Chart 1: Répartition par Catégorie (Barres de progression) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">💡 {translateText('Idées par Catégorie')}</h3>
            <span className="chart-badge">{ideas.length} {t('dashboard.stat_ideas')}</span>
          </div>

          <div className="category-bars-list">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalIdeas) * 100);
              const color = categoryColors[cat] || '#00563B';

              return (
                <div key={cat} className="bar-item">
                  <div className="bar-info-row">
                    <span className="bar-label">
                      <span className="dot-indicator" style={{ backgroundColor: color }} />
                      {translateText(cat)}
                    </span>
                    <span className="bar-val">
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Répartition des Statuts (Donut Chart SVG Native) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">🍩 {translateText('Taux d\'Approbation & Statuts')}</h3>
            <span className="chart-badge">{totalStatus} {translateText('soumissions')}</span>
          </div>

          <div className="donut-wrapper">
            <svg viewBox="0 0 100 100" className="donut-svg">
              {/* Fond Gris */}
              <circle cx="50" cy="50" r="40" className="donut-bg" />

              {/* Arc Approuvé (Vert) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="donut-segment approved"
                style={{
                  strokeDasharray: `${approvedPct * 2.51} 251`,
                  strokeDashoffset: 0
                }}
              />

              {/* Arc En attente (Orange) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="donut-segment pending"
                style={{
                  strokeDasharray: `${pendingPct * 2.51} 251`,
                  strokeDashoffset: `-${approvedPct * 2.51}`
                }}
              />

              {/* Arc Rejeté (Rouge) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="donut-segment rejected"
                style={{
                  strokeDasharray: `${rejectedPct * 2.51} 251`,
                  strokeDashoffset: `-${(approvedPct + pendingPct) * 2.51}`
                }}
              />
            </svg>

            <div className="donut-center-text">
              <div className="center-val">{approvedPct}%</div>
              <div className="center-lbl">{translateText('Approuvées')}</div>
            </div>
          </div>

          <div className="donut-legend">
            <div className="legend-item">
              <span className="dot-indicator" style={{ backgroundColor: '#15803d' }} />
              <span>{translateText('Approuvées')} (<strong>{approvedCount}</strong>)</span>
            </div>
            <div className="legend-item">
              <span className="dot-indicator" style={{ backgroundColor: '#d97706' }} />
              <span>{translateText('En attente')} (<strong>{pendingCount}</strong>)</span>
            </div>
            <div className="legend-item">
              <span className="dot-indicator" style={{ backgroundColor: '#dc2626' }} />
              <span>{translateText('Rejetées')} (<strong>{rejectedCount}</strong>)</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Tendance Mensuelle (Line Chart SVG Native) */}
        <div className="chart-card full-width">
          <div className="chart-card-header">
            <h3 className="chart-title">📈 {translateText('Croissance Mensuelle des Contributions')}</h3>
            <span className="chart-badge">2026</span>
          </div>

          <div className="line-chart-wrapper">
            <svg viewBox="0 0 400 120" className="line-svg">
              {/* Grille de fond */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#f3f4f6" strokeWidth="1" />

              {/* Ligne de tendance */}
              <polyline
                fill="none"
                stroke="#00563B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={monthlyData
                  .map((d, i) => {
                    const x = 40 + i * 110;
                    const y = 110 - (d.count / maxVal) * 80;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Points de données avec Tooltips */}
              {monthlyData.map((d, i) => {
                const x = 40 + i * 110;
                const y = 110 - (d.count / maxVal) * 80;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="#00563B" stroke="#ffffff" strokeWidth="2" />
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#00563B">
                      {d.count}
                    </text>
                    <text x={x} y="118" textAnchor="middle" fontSize="10" fill="#6b7280">
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
