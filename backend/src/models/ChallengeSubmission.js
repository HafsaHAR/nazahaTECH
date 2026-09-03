const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Le défi est obligatoire'],
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Le titre de la proposition est obligatoire'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true
    },
    category: {
      type: String,
      default: 'Général'
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: String,
        extension: String
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true
    },
    score: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const ChallengeSubmission = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);

module.exports = ChallengeSubmission;
