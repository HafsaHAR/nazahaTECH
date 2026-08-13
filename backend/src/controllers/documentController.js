const Document = require('../models/Document');
const path = require('path');

// GET /api/documents — Obtenir la liste des documents (Public & Participant)
const getDocuments = async (req, res) => {
  try {
    const { search, type, accessLevel } = req.query;
    let query = { status: 'PUBLISHED' };

    if (type && type !== 'Toutes') {
      query.type = type;
    }

    if (accessLevel) {
      query.accessLevel = accessLevel;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { source: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const documents = await Document.find(query).sort({ publicationDate: -1 });

    return res.status(200).json({
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Erreur récupération documents :', error);
    return res.status(500).json({ message: 'Erreur lors du chargement de la base documentaire.' });
  }
};

// POST /api/documents/upload — Téléverser un fichier local (Réservé à l'Admin)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été transmis.' });
    }

    const rawExt = path.extname(req.file.originalname).replace('.', '').toUpperCase();
    const extension = rawExt === 'DOCX' || rawExt === 'DOC' ? 'DOCX' : rawExt === 'XLSX' || rawExt === 'XLS' ? 'XLSX' : 'PDF';

    const bytes = req.file.size;
    const fileSize = bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/documents/${req.file.filename}`;

    return res.status(200).json({
      message: 'Fichier téléversé avec succès.',
      fileUrl,
      fileName: req.file.originalname,
      extension,
      fileSize
    });
  } catch (error) {
    console.error('Erreur téléversement fichier :', error);
    return res.status(500).json({ message: 'Erreur lors du téléversement du fichier.' });
  }
};

// POST /api/documents — Publier le document avec ses métadonnées (Réservé à l'Admin)
const createDocument = async (req, res) => {
  try {
    const { title, description, type, fileUrl, fileSize, extension, accessLevel, source } = req.body;

    if (!title || !description || !fileUrl) {
      return res.status(400).json({ message: 'Le titre, la description et le fichier sont obligatoires.' });
    }

    const newDocument = await Document.create({
      title,
      description,
      type: type || 'Guides',
      fileUrl,
      fileSize: fileSize || '2.0 MB',
      extension: extension || 'PDF',
      accessLevel: accessLevel || 'PUBLIC',
      source: source || 'INPPLC Maroc',
      status: 'PUBLISHED',
      publicationDate: new Date()
    });

    return res.status(201).json({
      message: 'Document téléversé et publié dans la Bibliothèque avec succès.',
      document: newDocument
    });
  } catch (error) {
    console.error('Erreur création document :', error);
    return res.status(500).json({ message: 'Erreur lors de la publication du document.' });
  }
};

// DELETE /api/documents/:id — Supprimer un document (Réservé à l'Admin)
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document introuvable.' });
    }

    await Document.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Document supprimé de la Bibliothèque avec succès.' });
  } catch (error) {
    console.error('Erreur suppression document :', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression du document.' });
  }
};

module.exports = {
  getDocuments,
  uploadFile,
  createDocument,
  deleteDocument
};
