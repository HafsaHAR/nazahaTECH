const express = require('express');
const router = express.Router();
const {
  createParticipation,
  getParticipations,
  approveParticipation,
  rejectParticipation
} = require('../controllers/participationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Création d'une participation (Citoyen connecté)
router.post('/', protect, createParticipation);

// Récupération des participations pour modération (Admin)
router.get('/', protect, authorize('admin'), getParticipations);

// Approbation par l'administrateur
router.patch('/:id/approve', protect, authorize('admin'), approveParticipation);

// Rejet par l'administrateur
router.patch('/:id/reject', protect, authorize('admin'), rejectParticipation);

module.exports = router;
