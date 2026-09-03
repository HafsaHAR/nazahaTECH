const Idea = require('../models/Idea');
const User = require('../models/User');

const runSeedIdeasIfEmpty = async () => {
  try {
    const count = await Idea.countDocuments({ challengeId: { $in: [null, '', 'null', 'undefined'] } });
    if (count >= 4) {
      console.log(`ℹ️ La base de données contient déjà ${count} idées citoyennes. Seeding ignoré.`);
      return;
    }

    console.log('Seeding des idées citoyennes de la Galerie...');
    const adminUser = await User.findOne({ role: 'admin' });
    const authorId = adminUser ? adminUser._id : null;

    const sampleIdeas = [
      {
        title: 'Plateforme Nationale d\'Audit Citoyen des Subventions Publiques',
        category: 'Transparence',
        description: 'Mettre en place une cartographie interactive ouverte permettant aux citoyens de visualiser la répartition des subventions accordées aux associations et projets locaux.',
        status: 'approved',
        author: authorId,
        createdBy: authorId,
        voteCount: 142,
        attachments: []
      },
      {
        title: 'Application Mobile de Signalement Anonyme des Infractions d\'Éthique',
        category: 'Digital',
        description: 'Application sécurisée avec chiffrement de bout en bout pour permettre aux citoyens de signaler les dépassements dans la gestion des équipements publics.',
        status: 'approved',
        author: authorId,
        createdBy: authorId,
        voteCount: 98,
        attachments: []
      },
      {
        title: 'Open Data des Déclarations de Patrimoine des Élus Locaux',
        category: 'Prévention',
        description: 'Publier sous format de données ouvertes les synthèses certifiées des déclarations de patrimoine des responsables publics pour renforcer la confiance citoyenne.',
        status: 'approved',
        author: authorId,
        createdBy: authorId,
        voteCount: 76,
        attachments: []
      },
      {
        title: 'Modules Éducatifs d\'Éthique et de Probité pour la Jeunesse',
        category: 'Éducation',
        description: 'Intégrer des supports numériques ludiques et ateliers citoyens dans le cursus scolaire pour sensibiliser les élèves aux valeurs d\'intégrité.',
        status: 'approved',
        author: authorId,
        createdBy: authorId,
        voteCount: 54,
        attachments: []
      }
    ];

    await Idea.insertMany(sampleIdeas);
    console.log(`✅ Seeding des idées réussi : ${sampleIdeas.length} idées insérées.`);
  } catch (error) {
    console.error('❌ Erreur seeding des idées :', error.message);
  }
};

module.exports = { runSeedIdeasIfEmpty };
