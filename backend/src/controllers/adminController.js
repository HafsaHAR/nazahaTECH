const Idea = require('../models/Idea');
const IdeaHistory = require('../models/IdeaHistory');
const Participation = require('../models/Participation');
const User = require('../models/User');

/**
 * @desc    Obtenir les métriques et agrégations du tableau de bord d'administration
 * @route   GET /api/admin/metrics
 * @access  Private (Admin uniquement)
 */
const getAdminMetrics = async (req, res) => {
  try {
    // 1. Répartition du nombre d'idées par statut (pending, approved) dans la collection 'ideas'
    const statusAggregation = await Idea.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    statusAggregation.forEach((item) => {
      if (item._id) {
        statusCounts[item._id] = item.count;
      }
    });

    // Décompte des idées rejetées depuis la collection d'historique
    statusCounts.rejected = await IdeaHistory.countDocuments();

    // 2. Nombre d'idées soumises durant les dernières 24 heures
    const last24hDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newIdeas24h = await Idea.countDocuments({
      createdAt: { $gte: last24hDate }
    });

    // 3. Agrégation $lookup entre 'ideas' et 'participations'
    const ideasWithParticipants = await Idea.aggregate([
      {
        $lookup: {
          from: 'participations',
          localField: '_id',
          foreignField: 'ideaId',
          as: 'participants'
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          status: 1,
          createdAt: 1,
          participantsCount: { $size: '$participants' }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalParticipations = await Participation.countDocuments();

    return res.status(200).json({
      totalIdeas: statusCounts.pending + statusCounts.approved + statusCounts.rejected,
      statusCounts,
      newIdeas24h,
      totalUsers,
      totalParticipations,
      ideasWithParticipants
    });

  } catch (error) {
    console.error('❌ Erreur lors du calcul des métriques administrateur :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la génération des métriques administrateur.',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir l'historique d'archivage des idées rejetées (Réservé à l'Admin)
 * @route   GET /api/admin/history
 * @access  Private (Admin uniquement)
 */
const getRejectedHistory = async (req, res) => {
  try {
    const history = await IdeaHistory.find()
      .populate('author', 'firstName lastName email role')
      .populate('rejectedBy', 'firstName lastName email role')
      .sort({ rejectedAt: -1 });

    return res.status(200).json({
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Erreur chargement historique des rejets :', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération de l\'historique des rejets.'
    });
  }
};

module.exports = {
  getAdminMetrics,
  getRejectedHistory
};
