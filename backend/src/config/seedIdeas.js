const Idea = require('../models/Idea');
const User = require('../models/User');

const runSeedIdeasIfEmpty = async () => {
  try {
    const count = await Idea.countDocuments({
      $or: [
        { challengeId: null },
        { challengeId: '' },
        { challengeId: 'null' },
        { challengeId: 'undefined' },
        { challengeId: { $exists: false } }
      ]
    });

    if (count >= 4) {
      console.log(`ℹ️ La base de données contient déjà ${count} idées citoyennes. Seeding d'idées ignoré.`);
      return;
    }

    console.log('Seeding des idées citoyennes de la Galerie...');
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({});
    }
    const authorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    const sampleIdeas = [
      {
        title: 'Plateforme Nationale d\'Audit Citoyen des Subventions Publiques',
        category: 'Transparence',
        description: 'Mettre en place une cartographie interactive ouverte permettant aux citoyens de visualiser la répartition des subventions accordées aux associations et projets locaux.',
        status: 'approved',
        author: authorId,
        createdBy: authorId,
        voteCount: 142,
        voters: [authorId],
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
        voters: [authorId],
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
        voters: [authorId],
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
        voters: [authorId],
        attachments: []
      }
    ];

    await Idea.insertMany(sampleIdeas);
    console.log(`✅ Seeding des idées réussi : ${sampleIdeas.length} idées citoyennes insérées avec succès.`);
  } catch (error) {
    console.error('❌ Erreur seeding des idées :', error.message);
  }
};

module.exports = { runSeedIdeasIfEmpty };
