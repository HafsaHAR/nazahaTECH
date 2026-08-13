const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre du document est obligatoire'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La description du document est obligatoire'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Lois', 'Guides', 'Rapports', 'Normes', 'Modèles'],
      required: true,
      default: 'Guides'
    },
    fileUrl: {
      type: String,
      required: true,
      default: 'https://inpplc.ma/documents/sample-guide.pdf'
    },
    fileSize: {
      type: String,
      default: '2.4 MB'
    },
    extension: {
      type: String,
      enum: ['PDF', 'DOCX', 'XLSX'],
      default: 'PDF'
    },
    accessLevel: {
      type: String,
      enum: ['PUBLIC', 'PARTNER', 'INTERNAL', 'RESTRICTED'],
      default: 'PUBLIC'
    },
    source: {
      type: String,
      default: 'INPPLC Maroc'
    },
    status: {
      type: String,
      enum: ['PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED'
    },
    publicationDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

documentSchema.index({ title: 'text', description: 'text' });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
