const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true
    },
    challengeId: {
      type: String,
      required: [true, 'Le défi est obligatoire'],
      index: true
    },
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Idea',
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Participation = mongoose.model('Participation', participationSchema);

module.exports = Participation;
