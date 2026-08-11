const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Idea = require('../models/Idea');
const Notification = require('../models/Notification');

/**
 * @desc    Create a root comment on an idea
 * @route   POST /api/comments
 * @access  Private (JWT required)
 */
const createComment = async (req, res) => {
  try {
    const { ideaId, content } = req.body;

    if (!ideaId || !content || !content.trim()) {
      return res.status(400).json({
        message: 'Idea ID and content are required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(ideaId)) {
      return res.status(400).json({ message: 'Invalid Idea ID format.' });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    const comment = await Comment.create({
      ideaId,
      author: req.user._id,
      content: content.trim(),
      parentId: null
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'firstName lastName email role'
    );

    return res.status(201).json({
      message: 'Comment posted successfully.',
      comment: {
        ...populatedComment.toObject(),
        replies: []
      }
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      message: 'Server error while creating comment.',
      error: error.message
    });
  }
};

/**
 * @desc    Get comments tree for an idea with sorting (recent | popular)
 * @route   GET /api/comments?ideaId=:id&sort=recent|popular
 * @access  Public
 */
const getComments = async (req, res) => {
  try {
    const { ideaId, sort = 'recent' } = req.query;

    if (!ideaId || !mongoose.Types.ObjectId.isValid(ideaId)) {
      return res.status(400).json({ message: 'Valid ideaId query parameter is required.' });
    }

    const allComments = await Comment.find({ ideaId })
      .populate('author', 'firstName lastName email role')
      .sort({ createdAt: 1 })
      .lean();

    // Map comments with reaction counts
    const formattedComments = allComments.map((c) => ({
      ...c,
      content: c.isDeleted ? 'This comment has been removed by administration' : c.content,
      likeCount: c.reactions?.like?.length || 0,
      dislikeCount: c.reactions?.dislike?.length || 0,
      likes: c.reactions?.like || [],
      dislikes: c.reactions?.dislike || []
    }));

    // Build comment tree (Group by parentId)
    const commentMap = {};
    const rootComments = [];

    formattedComments.forEach((c) => {
      commentMap[c._id.toString()] = { ...c, replies: [] };
    });

    formattedComments.forEach((c) => {
      if (c.parentId) {
        const parentKey = c.parentId.toString();
        if (commentMap[parentKey]) {
          commentMap[parentKey].replies.push(commentMap[c._id.toString()]);
        } else {
          rootComments.push(commentMap[c._id.toString()]);
        }
      } else {
        rootComments.push(commentMap[c._id.toString()]);
      }
    });

    // Apply sorting to root comments
    if (sort === 'popular') {
      rootComments.sort((a, b) => b.likeCount - a.likeCount);
    } else {
      rootComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      count: formattedComments.length,
      comments: rootComments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      message: 'Server error while fetching comments.',
      error: error.message
    });
  }
};

/**
 * @desc    Reply to an existing comment
 * @route   POST /api/comments/:id/reply
 * @access  Private (JWT required)
 */
const replyToComment = async (req, res) => {
  try {
    const parentCommentId = req.params.id;
    const { content, ideaId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Reply content is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
      return res.status(400).json({ message: 'Invalid parent comment ID.' });
    }

    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found.' });
    }

    const reply = await Comment.create({
      ideaId: ideaId || parentComment.ideaId,
      author: req.user._id,
      content: content.trim(),
      parentId: parentCommentId
    });

    const populatedReply = await Comment.findById(reply._id).populate(
      'author',
      'firstName lastName email role'
    );

    // Trigger Notification for parent comment author if reply author is different
    if (parentComment.author.toString() !== req.user._id.toString()) {
      const senderName = req.user.name || `${req.user.firstName} ${req.user.lastName}`;
      await Notification.create({
        recipient: parentComment.author,
        sender: req.user._id,
        type: 'reply',
        message: `${senderName} replied to your comment.`,
        relatedEntityId: ideaId || parentComment.ideaId
      });
    }

    return res.status(201).json({
      message: 'Reply posted successfully.',
      comment: {
        ...populatedReply.toObject(),
        replies: []
      }
    });

  } catch (error) {
    console.error('Error replying to comment:', error);
    return res.status(500).json({
      message: 'Server error while replying.',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle reaction (like / dislike) on a comment
 * @route   POST /api/comments/:id/react
 * @access  Private (JWT required)
 */
const reactToComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { type } = req.body; // 'like' | 'dislike'
    const userId = req.user._id;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: "Reaction type must be 'like' or 'dislike'." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (!comment.reactions) {
      comment.reactions = { like: [], dislike: [] };
    }

    const oppositeType = type === 'like' ? 'dislike' : 'like';

    const hasReactedType = comment.reactions[type].some(
      (id) => id && id.toString() === userId.toString()
    );
    const hasReactedOpposite = comment.reactions[oppositeType].some(
      (id) => id && id.toString() === userId.toString()
    );

    if (hasReactedType) {
      // Toggle OFF if already reacted with same type
      comment.reactions[type] = comment.reactions[type].filter(
        (id) => id && id.toString() !== userId.toString()
      );
    } else {
      // If switching from opposite, remove from opposite array first
      if (hasReactedOpposite) {
        comment.reactions[oppositeType] = comment.reactions[oppositeType].filter(
          (id) => id && id.toString() !== userId.toString()
        );
      }
      comment.reactions[type].push(userId);

      // Trigger notification for comment author on new like
      if (type === 'like' && comment.author.toString() !== userId.toString()) {
        const senderName = req.user.name || `${req.user.firstName} ${req.user.lastName}`;
        await Notification.create({
          recipient: comment.author,
          sender: userId,
          type: 'like',
          message: `${senderName} liked your comment.`,
          relatedEntityId: comment.ideaId
        });
      }
    }

    await comment.save();
    const updatedComment = await Comment.findById(commentId).populate(
      'author',
      'firstName lastName email role'
    );

    return res.status(200).json({
      message: 'Reaction updated.',
      comment: {
        ...updatedComment.toObject(),
        likeCount: updatedComment.reactions?.like?.length || 0,
        dislikeCount: updatedComment.reactions?.dislike?.length || 0,
        likes: updatedComment.reactions?.like || [],
        dislikes: updatedComment.reactions?.dislike || []
      }
    });

  } catch (error) {
    console.error('Error reacting to comment:', error);
    return res.status(500).json({
      message: 'Server error while updating reaction.',
      error: error.message
    });
  }
};

/**
 * @desc    Soft delete a comment (Admin Moderation)
 * @route   DELETE /api/comments/:id
 * @access  Private (Admin required)
 */
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    comment.isDeleted = true;
    comment.content = 'This comment has been removed by administration';
    await comment.save();

    return res.status(200).json({
      message: 'Comment removed successfully.',
      comment
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({
      message: 'Server error while deleting comment.',
      error: error.message
    });
  }
};

module.exports = {
  createComment,
  getComments,
  replyToComment,
  reactToComment,
  deleteComment
};
