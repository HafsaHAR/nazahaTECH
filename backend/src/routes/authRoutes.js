const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getActivitySummary
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected Auth & Profile routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.get('/activity/summary', protect, getActivitySummary);

module.exports = router;
