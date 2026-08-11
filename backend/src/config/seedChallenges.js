const Challenge = require('../models/Challenge');

const now = new Date();

const initialChallenges = [
  {
    title: 'Digitalisation des Marchés Publics Communaux',
    description: 'Concevoir une solution technologique innovante permettant de renforcer la transparence et le contrôle citoyen sur la passation et l\'exécution des marchés publics au niveau local.',
    category: 'Digital',
    status: 'open',
    reward: '50 000 MAD + accompagnement',
    duration: '4 semaines',
    startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    locationMode: 'remote',
    locationAddress: 'À distance (Plateforme digitale INPPLC)',
    participantsCount: 42,
    maxParticipants: 100,
    organization: 'INPPLC',
    extraFields: [
      { title: 'Jury et Évaluation', content: 'Le jury sera composé d\'experts de l\'INPPLC, du Ministère de la Transition Numérique et de professeurs universitaires.', order: 1 },
      { title: 'Objectifs Principaux', content: '1. Rendre lisibles les appels d\'offres locaux.\n2. Permettre le suivi citoyen de la livraison des chantiers.', order: 2 },
      { title: 'Livrables Attendus', content: 'Prototype fonctionnel web/mobile avec documentation d\'intégration API.', order: 3 }
    ]
  },
  {
    title: 'Sensibilisation des Jeunes aux Valeurs de Probité',
    description: 'Créer un jeu sérieux ou une application éducative interactive visant à promouvoir l\'éthique et la lutte contre la corruption auprès des étudiants et lycéens.',
    category: 'Éducation',
    status: 'in_progress',
    reward: '35 000 MAD + mentorat',
    duration: '3 semaines',
    startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    locationMode: 'onsite',
    locationAddress: 'Siège INPPLC, Avenue Annakhil, Hay Riad, Rabat',
    participantsCount: 88,
    maxParticipants: 100,
    organization: 'INPPLC',
    extraFields: [
      { title: 'Objectifs du Hackathon', content: 'Créer des récits interactifs captivants pour la jeunesse marocaine.', order: 1 },
      { title: 'Niveau de Difficulté', content: 'Intermédiaire à Avancé (Design UI/UX et Développement Gamification)', order: 2 }
    ]
  },
  {
    title: 'Observatoire Ouvert du Signalement Éthique',
    description: 'Proposer un mécanisme sécurisé, anonyme et crypté permettant aux citoyens et employés de signaler les manquements aux règles de probité administrative.',
    category: 'Prévention',
    status: 'open',
    reward: '60 000 MAD + incubation',
    duration: '6 semaines',
    startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
    locationMode: 'remote',
    locationAddress: 'À distance (Session finale hybride à Rabat)',
    participantsCount: 18,
    maxParticipants: 50,
    organization: 'INPPLC',
    extraFields: [
      { title: 'Exigences de Sécurité', content: 'Chiffrement de bout en bout et garanties strictes d\'anonymat conforme aux lois de protection des données.', order: 1 }
    ]
  },
  {
    title: 'Transparence des Budgets Participatifs',
    description: 'Développer une plateforme web permettant le suivi en temps réel de l\'allocation des fonds publics participatifs dans les collectivités territoriales.',
    category: 'Transparence',
    status: 'closed',
    reward: '40 000 MAD',
    duration: '4 semaines',
    startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    locationMode: 'remote',
    locationAddress: 'À distance',
    participantsCount: 50,
    maxParticipants: 50,
    organization: 'INPPLC',
    extraFields: [
      { title: 'Phases du Défi', content: 'Phase 1: Soumission (Terminé)\nPhase 2: Évaluation par le jury (Terminé)', order: 1 }
    ]
  }
];

const runSeedChallengesIfEmpty = async () => {
  try {
    const count = await Challenge.countDocuments();
    if (count === 0) {
      await Challenge.insertMany(initialChallenges);
      console.log('🌱 Base de données initialisée avec 4 défis INPPLC complets.');
    }
  } catch (error) {
    console.error('Erreur lors du seeding des défis :', error);
  }
};

module.exports = {
  runSeedChallengesIfEmpty
};
