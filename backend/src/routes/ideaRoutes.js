const express = require('express');
const router = express.Router();
const {
  createIdea,
  getIdeas,
  getIdeaById,
  approveIdea,
  rejectIdea,
  voteIdea
} = require('../controllers/ideaController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Route publique : Récupérer toutes les idées (avec filtres ?category=&search=&sort=)
router.get('/', getIdeas);

// Route publique : Récupérer une idée par son ID
router.get('/:id', getIdeaById);

// Route protégée : Soumettre une nouvelle idée
router.post('/', protect, createIdea);

// Route protégée Admin : Approuver une idée
router.patch('/:id/approve', protect, authorize('admin'), approveIdea);

// Route protégée Admin : Rejeter une idée
router.patch('/:id/reject', protect, authorize('admin'), rejectIdea);

// Route protégée : Voter pour une idée
router.post('/:id/vote', protect, voteIdea);

module.exports = router;
