const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  createChallenge,
  toggleBookmark,
  getChallenges,
  getChallengeById,
  getChallengeSubmissions
} = require('../controllers/challengeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Optional auth middleware to extract req.user if Authorization header is present
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
      // Ignore token errors for public routes
    }
  }
  next();
};

// Public routes (with optional auth for bookmark status extraction)
router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallengeById);

// Protected User routes (Bookmark favorite)
router.post('/:id/bookmark', protect, toggleBookmark);

// Protected Admin-ONLY routes: Create new challenge & View submissions
router.post('/', protect, authorize('admin'), createChallenge);
router.get('/:id/submissions', protect, authorize('admin'), getChallengeSubmissions);

module.exports = router;
