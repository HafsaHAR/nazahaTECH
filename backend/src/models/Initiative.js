const mongoose = require('mongoose');

const initiativeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre de l'initiative est obligatoire"],
      trim: true
    },
    organization: {
      type: String,
      required: [true, "L'organisation ou l'acteur est obligatoire"],
      trim: true
    },
    country: {
      type: String,
      required: true,
      default: 'Maroc'
    },
    city: {
      type: String,
      default: 'Rabat'
    },
    domain: {
      type: String,
      enum: ['Digital', 'Audit', 'Éducation', 'Control', 'Citizen Participation', 'Transparence'],
      required: true,
      default: 'Digital'
    },
    description: {
      type: String,
      required: [true, 'La description de l\'initiative est obligatoire']
    },
    maturityLevel: {
      type: String,
      enum: ['Idea', 'POC', 'Deployed'],
      required: true,
      default: 'Deployed'
    },
    actorType: {
      type: String,
      enum: ['Public', 'ONG', 'Startup', 'Académie', 'International'],
      default: 'Public'
    },
    year: {
      type: Number,
      default: 2025
    },
    contactEmail: {
      type: String,
      default: 'contact@inpplc.ma'
    },
    contactWebsite: {
      type: String,
      default: 'https://inpplc.ma'
    },
    impactEvidence: [
      {
        label: { type: String },
        url: { type: String }
      }
    ],
    tags: [
      { type: String }
    ]
  },
  { timestamps: true }
);

initiativeSchema.index({ title: 'text', description: 'text', organization: 'text' });

const Initiative = mongoose.model('Initiative', initiativeSchema);

module.exports = Initiative;
