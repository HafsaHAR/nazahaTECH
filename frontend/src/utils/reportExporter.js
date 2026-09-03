/**
 * Helper d'exportation de rapports officiels INPPLC au format PDF (Fenetre d'impression) et CSV
 */

export const exportPDFReport = ({ title, subtitle, data, columns, lang = 'fr', translateText = (t) => t }) => {
  const isRtl = lang === 'ar';
  const currentDate = new Date().toLocaleDateString(isRtl ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres surgissantes (pop-ups) pour exporter le rapport PDF.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #111827;
          margin: 0;
          padding: 40px;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #00563B;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand {
          font-size: 22px;
          font-weight: 800;
          color: #00563B;
        }
        .brand-sub {
          font-size: 13px;
          color: #4b5563;
        }
        .meta-date {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
        }
        .report-title {
          font-size: 24px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }
        .report-sub {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 24px;
        }
        .stats-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 16px;
          border-radius: 12px;
        }
        .stat-box {
          flex: 1;
          text-align: center;
        }
        .stat-val {
          font-size: 20px;
          font-weight: 800;
          color: #00563B;
        }
        .stat-lbl {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #00563B;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          text-align: ${isRtl ? 'right' : 'left'};
          padding: 12px 14px;
        }
        td {
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 14px;
          font-size: 13px;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          background-color: #e0f2fe;
          color: #0369a1;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">🇲🇦 INPPLC — NazahaTECH</div>
          <div class="brand-sub">Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption</div>
        </div>
        <div class="meta-date">
          📅 ${currentDate}
        </div>
      </div>

      <div class="report-title">${title}</div>
      <div class="report-sub">${subtitle}</div>

      <div class="stats-summary">
        <div class="stat-box">
          <div class="stat-val">${data.length}</div>
          <div class="stat-lbl">${translateText('Total des enregistrements')}</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${currentDate}</div>
          <div class="stat-lbl">${translateText('Date de génération')}</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">Officiel INPPLC</div>
          <div class="stat-lbl">${translateText('Statut du document')}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${columns
                .map((col) => {
                  const rawVal = col.accessor(row);
                  const val = translateText(rawVal);
                  return `<td>${val}</td>`;
                })
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        © 2026 INPPLC — Document officiel généré automatiquement depuis la plateforme NazahaTECH.
      </div>

      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const exportCSVReport = ({ filename, data, columns, translateText = (t) => t }) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }

  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = translateText(col.accessor(row) || '');
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
