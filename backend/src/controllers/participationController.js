const Participation = require('../models/Participation');
const Idea = require('../models/Idea');
const { triggerAdminNotification } = require('./notificationController');

/**
 * @desc    Enregistrer une participation à un défi par un citoyen
 * @route   POST /api/participations
 * @access  Private (User/Admin)
 */
const createParticipation = async (req, res) => {
  try {
    const { challengeId, ideaId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ message: 'Le paramètre challengeId est obligatoire.' });
    }

    // Vérifier si l'utilisateur a déjà une participation enregistrée pour ce défi
    const existing = await Participation.findOne({
      userId: req.user._id,
      challengeId: challengeId.toString()
    });

    if (existing) {
      return res.status(400).json({
        message: 'Vous avez déjà soumis une participation pour ce défi.'
      });
    }

    const participation = await Participation.create({
      userId: req.user._id,
      challengeId: challengeId.toString(),
      ideaId: ideaId || null,
      status: 'pending'
    });

    // Déclencher une notification automatique pour l'administrateur
    const userName = req.user.name || `${req.user.firstName} ${req.user.lastName}`;
    await triggerAdminNotification(
      'NEW_PARTICIPATION',
      `Nouvelle participation au défi par ${userName}`,
      participation._id
    );

    return res.status(201).json({
      message: 'Votre participation a été soumise avec succès et est en cours d\'examen par la modération.',
      participation
    });

  } catch (error) {
    console.error('Erreur lors de la création de la participation :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la soumission de la participation.',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir toutes les participations (Admin)
 * @route   GET /api/participations
 * @access  Private (Admin)
 */
const getParticipations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const participations = await Participation.find(filter)
      .populate('userId', 'firstName lastName email role')
      .populate('ideaId', 'title category description')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: participations.length,
      participations
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la récupération des participations.'
    });
  }
};

/**
 * @desc    Approuver une participation (Admin)
 * @route   PATCH /api/participations/:id/approve
 * @access  Private (Admin)
 */
const approveParticipation = async (req, res) => {
  try {
    const participation = await Participation.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!participation) {
      return res.status(404).json({ message: 'Participation introuvable.' });
    }

    // Si une idée est liée, incrémenter le nombre de participants sur l'idée
    if (participation.ideaId) {
      await Idea.findByIdAndUpdate(participation.ideaId, { $inc: { participantsCount: 1 } });
    }

    return res.status(200).json({
      message: 'Participation approuvée avec succès.',
      participation
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de l\'approbation de la participation.' });
  }
};

/**
 * @desc    Rejeter une participation (Admin)
 * @route   PATCH /api/participations/:id/reject
 * @access  Private (Admin)
 */
const rejectParticipation = async (req, res) => {
  try {
    const participation = await Participation.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!participation) {
      return res.status(404).json({ message: 'Participation introuvable.' });
    }

    return res.status(200).json({
      message: 'Participation rejetée.',
      participation
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du rejet de la participation.' });
  }
};

module.exports = {
  createParticipation,
  getParticipations,
  approveParticipation,
  rejectParticipation
};
