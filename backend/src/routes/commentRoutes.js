const express = require('express');
const router = express.Router();
const {
  createComment,
  getComments,
  replyToComment,
  reactToComment,
  deleteComment
} = require('../controllers/commentController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { commentRateLimiter, reactionRateLimiter } = require('../middlewares/rateLimiter');

// Public route: Fetch comments tree for an idea
router.get('/', getComments);

// Protected routes: Comment creation with rate limiting
router.post('/', protect, commentRateLimiter, createComment);

// Protected routes: Reply to comment with rate limiting
router.post('/:id/reply', protect, commentRateLimiter, replyToComment);

// Protected routes: Reaction (like/dislike) toggle with rate limiting
router.post('/:id/react', protect, reactionRateLimiter, reactToComment);

// Protected Admin route: Soft delete comment for moderation
router.delete('/:id', protect, authorize('admin'), deleteComment);

module.exports = router;
