const Document = require('../models/Document');

const runSeedDocumentsIfEmpty = async () => {
  try {
    const count = await Document.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ La base de données contient déjà ${count} documents. Seeding de la Bibliothèque ignoré.`);
      return;
    }

    console.log('Seeding des documents de la Bibliothèque INPPLC...');

    const sampleDocs = [
      {
        title: 'Loi n° 46-19 relative à l\'Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption',
        description: 'Cadre juridique fixant les attributions, l\'organisation et les règles de fonctionnement de l\'INPPLC au Maroc.',
        type: 'Lois',
        fileUrl: 'https://inpplc.ma/documents/Loi_46_19_INPPLC.pdf',
        fileSize: '1.8 MB',
        extension: 'PDF',
        accessLevel: 'PUBLIC',
        source: 'Bulletin Officiel du Royaume du Maroc',
        publicationDate: new Date('2021-04-15')
      },
      {
        title: 'Guide Pratique de Gestion des Risques de Corruption dans le Secteur Public',
        description: 'Guide méthodologique à l\'usage des administrations publiques pour la cartographie et l\'atténuation des risques de probité.',
        type: 'Guides',
        fileUrl: 'https://inpplc.ma/documents/Guide_Gestion_Risques_INPPLC.pdf',
        fileSize: '3.4 MB',
        extension: 'PDF',
        accessLevel: 'PUBLIC',
        source: 'INPPLC - Direction de la Prévention',
        publicationDate: new Date('2024-09-10')
      },
      {
        title: 'Rapport Annuel sur l\'État de la Probité et la Lutte contre la Corruption au Maroc (2024)',
        description: 'Analyse statistique globale, indicateurs de perception et bilan des actions de prévention menées au niveau national.',
        type: 'Rapports',
        fileUrl: 'https://inpplc.ma/documents/Rapport_Annuel_INPPLC_2024.pdf',
        fileSize: '5.2 MB',
        extension: 'PDF',
        accessLevel: 'PUBLIC',
        source: 'INPPLC Observatoire National',
        publicationDate: new Date('2025-01-20')
      },
      {
        title: 'Standard ISO 37001 — Système de Management Anti-Corruption (Présentation & Synthèse)',
        description: 'Synthèse des exigences de la norme internationale ISO 37001 pour la mise en place d\'un dispositif de conformité d\'entreprise.',
        type: 'Normes',
        fileUrl: 'https://inpplc.ma/documents/Synthese_ISO_37001.pdf',
        fileSize: '2.1 MB',
        extension: 'PDF',
        accessLevel: 'PUBLIC',
        source: 'INPPLC & Organisation Internationale de Normalisation',
        publicationDate: new Date('2023-11-05')
      },
      {
        title: 'Modèle de Clause Contractuelle de Probite et d\'Éthique pour les Marchés Publics',
        description: 'Modèle standardisé de clause anti-corruption à insérer dans les cahiers des charges et contrats d\'approvisionnement.',
        type: 'Modèles',
        fileUrl: 'https://inpplc.ma/documents/Modele_Clause_Probite_Marches.docx',
        fileSize: '450 KB',
        extension: 'DOCX',
        accessLevel: 'PUBLIC',
        source: 'INPPLC Division Juridique',
        publicationDate: new Date('2024-06-12')
      }
    ];

    await Document.insertMany(sampleDocs);
    console.log(`✅ Seeding des documents réussi : ${sampleDocs.length} documents insérés.`);
  } catch (error) {
    console.error('❌ Erreur seeding des documents :', error.message);
  }
};

module.exports = { runSeedDocumentsIfEmpty };
