const mongoose = require('mongoose');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Challenge = require('../models/Challenge');
const { triggerAdminNotification } = require('./notificationController');

/**
 * @desc    Créer une soumission dédiée à un défi spécifique
 * @route   POST /api/challenges/:challengeId/submissions
 * @access  Private (JWT requis)
 */
const createSubmission = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { title, description, category, attachments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ message: 'Identifiant de défi invalide.' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Défi introuvable.' });
    }

    if (!title || !description) {
      return res.status(400).json({ message: 'Veuillez remplir le titre et la description de votre proposition.' });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ message: 'Le titre doit contenir au moins 3 caractères.' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ message: 'La description doit contenir au moins 10 caractères.' });
    }

    const submission = await ChallengeSubmission.create({
      challengeId,
      userId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || challenge.category || 'Général',
      attachments: Array.isArray(attachments) ? attachments : [],
      status: 'pending'
    });

    // Incrementer le nombre de participants du défi
    await Challenge.findByIdAndUpdate(challengeId, { $inc: { participantsCount: 1 } });

    // Notification Admin
    const userName = req.user.name || `${req.user.firstName} ${req.user.lastName}`;
    await triggerAdminNotification(
      'NEW_IDEA',
      `Nouvelle soumission au défi "${challenge.title}" par ${userName}`,
      submission._id
    );

    const populatedSubmission = await ChallengeSubmission.findById(submission._id)
      .populate('userId', 'firstName lastName email role')
      .populate('challengeId', 'title category status organization');

    return res.status(201).json({
      message: 'Votre proposition pour le défi a été soumise avec succès et enregistrée dans la BDD.',
      submission: populatedSubmission
    });
  } catch (error) {
    console.error('❌ Erreur création soumission défi :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de l\'enregistrement de la soumission.',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer toutes les soumissions d'un défi spécifique (Réservé Admin)
 * @route   GET /api/challenges/:challengeId/submissions
 * @access  Private (Admin requis)
 */
const getSubmissionsByChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ message: 'Identifiant de défi invalide.' });
    }

    const submissions = await ChallengeSubmission.find({ challengeId })
      .populate('userId', 'firstName lastName email role')
      .populate('challengeId', 'title category organization status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('❌ Erreur récupération soumissions du défi :', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des soumissions.' });
  }
};

/**
 * @desc    Récupérer l'historique des soumissions de l'utilisateur connecté
 * @route   GET /api/challenge-submissions/my
 * @access  Private (JWT requis)
 */
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await ChallengeSubmission.find({ userId: req.user._id })
      .populate('challengeId', 'title category organization status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('❌ Erreur récupération historique des soumissions :', error);
    return res.status(500).json({ message: 'Erreur lors du chargement de vos soumissions aux défis.' });
  }
};

/**
 * @desc    Mettre à jour le statut, score et feedback d'une soumission (Admin)
 * @route   PUT /api/challenge-submissions/:id/status
 * @access  Private (Admin requis)
 */
const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, score, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant de soumission invalide.' });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (typeof score === 'number') updateFields.score = score;
    if (feedback !== undefined) updateFields.feedback = feedback.trim();

    const updated = await ChallengeSubmission.findByIdAndUpdate(id, updateFields, { new: true })
      .populate('userId', 'firstName lastName email role')
      .populate('challengeId', 'title category organization status');

    if (!updated) {
      return res.status(404).json({ message: 'Soumission introuvable.' });
    }

    return res.status(200).json({
      message: 'Statut et évaluation de la soumission mis à jour avec succès.',
      submission: updated
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour soumission :', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la soumission.' });
  }
};

/**
 * @desc    Supprimer une soumission au défi
 * @route   DELETE /api/challenge-submissions/:id
 * @access  Private (Propriétaire ou Admin)
 */
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }

    const sub = await ChallengeSubmission.findById(id);
    if (!sub) {
      return res.status(404).json({ message: 'Soumission introuvable.' });
    }

    if (sub.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    await ChallengeSubmission.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Soumission supprimée avec succès.' });
  } catch (error) {
    console.error('❌ Erreur suppression soumission :', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression de la soumission.' });
  }
};

module.exports = {
  createSubmission,
  getSubmissionsByChallenge,
  getUserSubmissions,
  updateSubmissionStatus,
  deleteSubmission
};
