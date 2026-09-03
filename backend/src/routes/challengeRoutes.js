const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  createChallenge,
  toggleBookmark,
  getChallenges,
  getChallengeById
} = require('../controllers/challengeController');
const {
  createSubmission,
  getSubmissionsByChallenge
} = require('../controllers/challengeSubmissionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Middleware d'authentification optionnel pour déduire l'état d'enregistrement en favori (isSaved)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'nazahatech_jwt_secret_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignorer les erreurs pour les routes publiques
    }
  }
  next();
};

// Routes publiques de consultation des défis
router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallengeById);

// Route protégée utilisateur : Marquer / retirer des favoris
router.post('/:id/bookmark', protect, toggleBookmark);

// Route protégée utilisateur : Soumettre une idée dédiée à un défi (ChallengeSubmission)
router.post('/:challengeId/submissions', protect, createSubmission);

// Route réservée aux administrateurs : Consulter toutes les soumissions d'un défi spécifique
router.get('/:challengeId/submissions', protect, authorize('admin'), getSubmissionsByChallenge);

// Route réservée aux administrateurs : Créer un nouveau défi
router.post('/', protect, authorize('admin'), createChallenge);

module.exports = router;
