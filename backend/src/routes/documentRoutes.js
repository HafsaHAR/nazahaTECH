const express = require('express');
const router = express.Router();
const { getDocuments, uploadFile, createDocument, deleteDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Route publique (Consultation & Téléchargement pour Visiteurs et Participants)
router.get('/', getDocuments);

// Routes d'administration sécurisées (Téléversement, Publication & Suppression)
router.post('/upload', protect, authorize('admin'), upload.single('file'), uploadFile);
router.post('/', protect, authorize('admin'), createDocument);
router.delete('/:id', protect, authorize('admin'), deleteDocument);

module.exports = router;
