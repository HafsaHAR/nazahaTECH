const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getUserSubmissions,
  updateSubmissionStatus,
  deleteSubmission
} = require('../controllers/challengeSubmissionController');

// Routes relatives aux soumissions individuelles de défis
router.get('/challenge-submissions/my', protect, getUserSubmissions);
router.put('/challenge-submissions/:id/status', protect, authorize('admin'), updateSubmissionStatus);
router.delete('/challenge-submissions/:id', protect, deleteSubmission);

module.exports = router;
