const express = require('express');
const router = express.Router();
const {
  getUserIdeas,
  getUserComments,
  getUserChallenges,
  getUserInteractions
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Paginated activity endpoints for current user
router.get('/me/ideas', protect, getUserIdeas);
router.get('/me/comments', protect, getUserComments);
router.get('/me/challenges', protect, getUserChallenges);
router.get('/me/interactions', protect, getUserInteractions);

module.exports = router;
