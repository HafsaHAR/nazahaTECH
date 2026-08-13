const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: String, default: '' },
    extension: { type: String, default: '' }
  },
  { _id: false }
);

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l\'idée est obligatoire'],
      trim: true,
      minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
      maxlength: [150, 'Le titre ne peut pas dépasser 150 caractères']
    },
    category: {
      type: String,
      required: [true, 'La catégorie est obligatoire'],
      enum: {
        values: ['Prévention', 'Transparence', 'Digital', 'Éducation'],
        message: 'La catégorie {VALUE} n\'est pas valide'
      },
      default: 'Prévention'
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true,
      minlength: [10, 'La description doit contenir au moins 10 caractères']
    },
    challengeId: {
      type: String,
      default: null
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'auteur est obligatoire'],
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'soumis'],
      default: 'pending',
      index: true
    },
    participantsCount: {
      type: Number,
      default: 0
    },
    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    voteCount: {
      type: Number,
      default: 0
    },
    attachments: [attachmentSchema]
  },
  {
    timestamps: true
  }
);

// Indexation de recherche textuelle pour des requêtes performantes sur MongoDB
ideaSchema.index({ title: 'text', description: 'text' });

// Normaliser automatiquement le statut 'soumis' vers 'pending' et autocompléter createdBy
ideaSchema.pre('save', function (next) {
  if (this.status === 'soumis') {
    this.status = 'pending';
  }
  if (!this.createdBy) {
    this.createdBy = this.author;
  }
  next();
});

const Idea = mongoose.model('Idea', ideaSchema);

module.exports = Idea;
