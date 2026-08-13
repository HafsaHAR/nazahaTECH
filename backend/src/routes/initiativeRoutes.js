const express = require('express');
const router = express.Router();
const {
  getInitiatives,
  getInitiativeById,
  createInitiative,
  updateInitiative,
  deleteInitiative
} = require('../controllers/initiativeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Routes publiques (Consultation pour Visiteurs et Participants)
router.get('/', getInitiatives);
router.get('/:id', getInitiativeById);

// Routes d'administration (Ajout, Modification & Suppression par l'Admin)
router.post('/', protect, authorize('admin'), createInitiative);
router.put('/:id', protect, authorize('admin'), updateInitiative);
router.delete('/:id', protect, authorize('admin'), deleteInitiative);

module.exports = router;
