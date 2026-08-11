const mongoose = require('mongoose');

const extraFieldSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Extra field title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Extra field content is required'],
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Prévention', 'Transparence', 'Digital', 'Éducation'],
      default: 'Prévention',
      index: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'closed', 'upcoming', 'active'],
      default: 'open',
      index: true
    },
    reward: {
      type: String,
      default: '50 000 MAD + accompagnement'
    },
    duration: {
      type: String,
      default: '4 semaines'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required']
    },
    locationMode: {
      type: String,
      enum: ['remote', 'onsite'],
      default: 'remote'
    },
    locationAddress: {
      type: String,
      default: ''
    },
    participantsCount: {
      type: Number,
      default: 0
    },
    maxParticipants: {
      type: Number,
      default: 100
    },
    organization: {
      type: String,
      default: 'INPPLC'
    },
    extraFields: [extraFieldSchema]
  },
  {
    timestamps: true
  }
);

// Database Indexes for optimized query performance
challengeSchema.index({ startDate: 1 });
challengeSchema.index({ deadline: 1 });
challengeSchema.index({ locationMode: 1 });
challengeSchema.index({ title: 'text', description: 'text' });

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
