const mongoose = require('mongoose');
const Idea = require('../models/Idea');
const IdeaHistory = require('../models/IdeaHistory');
const { triggerAdminNotification } = require('./notificationController');

/**
 * @desc    Créer une nouvelle idée (soumission citoyenne avec statut 'pending' + notification admin)
 * @route   POST /api/ideas
 * @access  Private (JWT requis)
 */
const createIdea = async (req, res) => {
  try {
    const { title, category, description, challengeId } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        message: 'Veuillez remplir tous les champs obligatoires (titre, catégorie, description).'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        message: 'Le titre doit contenir au moins 3 caractères.'
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        message: 'La description doit contenir au moins 10 caractères.'
      });
    }

    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const idea = await Idea.create({
      title: title.trim(),
      category: category,
      description: description.trim(),
      challengeId: challengeId || null,
      author: req.user._id,
      createdBy: req.user._id,
      status: initialStatus,
      voters: [req.user._id],
      voteCount: 1
    });

    const userName = req.user.name || `${req.user.firstName} ${req.user.lastName}`;
    await triggerAdminNotification(
      'NEW_IDEA',
      `Nouvelle idée soumise par ${userName} : "${idea.title.substring(0, 40)}..."`,
      idea._id
    );

    const populatedIdea = await Idea.findById(idea._id).populate('author', 'firstName lastName email role');

    return res.status(201).json({
      message: 'Idée soumise avec succès. Elle est en cours de modération par l\'équipe INPPLC.',
      idea: populatedIdea
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'idée :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la sauvegarde de l\'idée.',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer la liste des idées avec filtrage multicritères, recherche textuelle et tri
 * @route   GET /api/ideas
 * @access  Public
 */
const getIdeas = async (req, res) => {
  try {
    const { category, search, sort, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'rejected' };
    }

    if (category && category !== 'Toutes' && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { voteCount: -1, createdAt: -1 };
    } else if (sort === 'recent') {
      sortOptions = { createdAt: -1 };
    }

    const ideas = await Idea.find(filter)
      .populate('author', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email role')
      .sort(sortOptions);

    return res.status(200).json({
      count: ideas.length,
      ideas
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des idées :', error);
    return res.status(500).json({
      message: 'Erreur lors du chargement des idées.',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer une seule idée par son ID (Vue détaillée /ideas/:id)
 * @route   GET /api/ideas/:id
 * @access  Public
 */
const getIdeaById = async (req, res) => {
  try {
    const ideaId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ideaId)) {
      return res.status(404).json({
        message: 'Idée introuvable (Format ID invalide).'
      });
    }

    const idea = await Idea.findById(ideaId)
      .populate('author', 'firstName lastName email role createdAt')
      .populate('createdBy', 'firstName lastName email role');

    if (!idea) {
      return res.status(404).json({
        message: 'L\'idée demandée n\'existe pas ou a été supprimée.'
      });
    }

    return res.status(200).json({
      idea
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'idée par ID :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors du chargement de l\'idée.',
      error: error.message
    });
  }
};

/**
 * @desc    Approuver une idée (Statut -> 'approved')
 * @route   PATCH /api/ideas/:id/approve
 * @access  Private (Admin)
 */
const approveIdea = async (req, res) => {
  try {
    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('author', 'firstName lastName email role');

    if (!idea) {
      return res.status(404).json({ message: 'Idée introuvable.' });
    }

    return res.status(200).json({
      message: 'Idée approuvée et publiée avec succès.',
      idea
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de l\'approbation de l\'idée.' });
  }
};

/**
 * @desc    Rejeter une idée : Archivage dans IdeaHistory + Suppression définitive de la collection 'ideas'
 * @route   PATCH /api/ideas/:id/reject
 * @access  Private (Admin)
 */
const rejectIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idée introuvable.' });
    }

    await IdeaHistory.create({
      originalIdeaId: idea._id,
      title: idea.title,
      category: idea.category,
      description: idea.description,
      author: idea.author,
      rejectedBy: req.user._id
    });

    await Idea.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'Idée rejetée, supprimée de la base de données utilisateur et archivée dans l\'historique d\'administration.'
    });
  } catch (error) {
    console.error('Erreur lors du rejet de l\'idée :', error);
    return res.status(500).json({ message: 'Erreur lors du traitement du rejet de l\'idée.' });
  }
};

/**
 * @desc    Voter pour une idée (Toggle vote robuste avec vérification null-safe)
 * @route   POST /api/ideas/:id/vote
 * @access  Private (JWT requis)
 */
const voteIdea = async (req, res) => {
  try {
    const ideaId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(ideaId)) {
      return res.status(404).json({ message: 'Idée introuvable.' });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: 'Idée introuvable.' });
    }

    if (!Array.isArray(idea.voters)) {
      idea.voters = [];
    }

    const hasVoted = idea.voters.some(
      (voterId) => voterId && voterId.toString() === userId.toString()
    );

    if (hasVoted) {
      idea.voters = idea.voters.filter(
        (voterId) => voterId && voterId.toString() !== userId.toString()
      );
      idea.voteCount = Math.max(0, (idea.voteCount || 1) - 1);
    } else {
      idea.voters.push(userId);
      idea.voteCount = (idea.voteCount || 0) + 1;
    }

    await idea.save();
    const updatedIdea = await Idea.findById(ideaId).populate('author', 'firstName lastName email role');

    return res.status(200).json({
      message: hasVoted ? 'Vote retiré.' : 'Vote enregistré.',
      idea: updatedIdea
    });
  } catch (error) {
    console.error('❌ Erreur lors du vote :', error);
    return res.status(500).json({
      message: 'Erreur lors du vote.',
      error: error.message
    });
  }
};

module.exports = {
  createIdea,
  getIdeas,
  getIdeaById,
  approveIdea,
  rejectIdea,
  voteIdea
};
