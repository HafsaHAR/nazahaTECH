const Initiative = require('../models/Initiative');

const runSeedInitiativesIfEmpty = async () => {
  try {
    const count = await Initiative.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ La base de données contient déjà ${count} initiatives. Seeding de l'Annuaire ignoré.`);
      return;
    }

    console.log('Seeding des initiatives innovantes de l\'Annuaire...');

    const sampleInitiatives = [
      {
        title: 'Chikaya.ma — Portail National des Réclamations Citoyennes',
        organization: 'Ministère de la Transition Numérique et de la Réforme de l\'Administration',
        country: 'Maroc',
        city: 'Rabat',
        domain: 'Digital',
        description: 'Plateforme nationale unifiée permettant aux citoyens de soumettre, suivre et évaluer le traitement des réclamations auprès de l\'ensemble des administrations publiques.',
        maturityLevel: 'Deployed',
        actorType: 'Public',
        year: 2022,
        contactEmail: 'contact@chikaya.ma',
        contactWebsite: 'https://www.chikaya.ma',
        impactEvidence: [
          { label: 'Bilan Annuel du Traitement des Réclamations (PDF)', url: 'https://chikaya.ma/rapport-2024.pdf' }
        ],
        tags: ['Digital', 'Transparence', 'Participation Citoyenne']
      },
      {
        title: 'Open Contracting Data Standard (OCDS) — Registre Public des Marchés',
        organization: 'Trésorerie Générale du Royaume (TGR) & INPPLC',
        country: 'Maroc',
        city: 'Rabat',
        domain: 'Audit',
        description: 'Implémentation du standard international d\'open data sur la commande publique assurant la traçabilité complète des appels d\'offres et l\'analyse des risques d\'entente.',
        maturityLevel: 'POC',
        actorType: 'Public',
        year: 2024,
        contactEmail: 'opendata@tgr.gov.ma',
        contactWebsite: 'https://www.marchespublics.gov.ma',
        impactEvidence: [
          { label: 'Portail Open Data Marchés Publics', url: 'https://marchespublics.gov.ma/opendata' }
        ],
        tags: ['Audit', 'Data', 'Transparence']
      },
      {
        title: 'Programme Génération Probité & Clubs Citoyens Scolaires',
        organization: 'ONG Transparency Maroc & Ministère de l\'Éducation Nationale',
        country: 'Maroc',
        city: 'Casablanca',
        domain: 'Éducation',
        description: 'Initiative éducative créant des clubs d\'éthique citoyenne dans les lycées pour sensibiliser les jeunes aux valeurs d\'intégrité et de lutte contre le favoritisme.',
        maturityLevel: 'Deployed',
        actorType: 'ONG',
        year: 2023,
        contactEmail: 'contact@transparencymaroc.ma',
        contactWebsite: 'https://transparencymaroc.ma',
        impactEvidence: [
          { label: 'Rapport d\'évaluation d\'impact éducatif 2024', url: 'https://transparencymaroc.ma/rapport-education.pdf' }
        ],
        tags: ['Éducation', 'Citizen Participation']
      },
      {
        title: 'Algorithme d\'IA pour la Détection des Anomalies de Déclaration de Patrimoine',
        organization: 'Laboratoire d\'Innovation INPPLC Tech',
        country: 'Maroc',
        city: 'Rabat',
        domain: 'Digital',
        description: 'Prototype d\'apprentissage automatique analysant les variations patrimoniales non justifiées et croisant les registres fonciers et fiscaux.',
        maturityLevel: 'Idea',
        actorType: 'Public',
        year: 2025,
        contactEmail: 'innovation@inpplc.ma',
        contactWebsite: 'https://inpplc.ma',
        impactEvidence: [],
        tags: ['Digital', 'Audit', 'Control']
      }
    ];

    await Initiative.insertMany(sampleInitiatives);
    console.log(`✅ Seeding des initiatives réussi : ${sampleInitiatives.length} initiatives insérées.`);
  } catch (error) {
    console.error('❌ Erreur seeding des initiatives :', error.message);
  }
};

module.exports = { runSeedInitiativesIfEmpty };
