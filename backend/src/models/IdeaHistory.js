const mongoose = require('mongoose');

const ideaHistorySchema = new mongoose.Schema(
  {
    originalIdeaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rejectedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const IdeaHistory = mongoose.model('IdeaHistory', ideaHistorySchema);

module.exports = IdeaHistory;
