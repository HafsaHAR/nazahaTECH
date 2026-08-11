const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Fonction utilitaire pour déclencher des notifications aux administrateurs
 */
const triggerAdminNotification = async (type, message, relatedEntityId) => {
  try {
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const docs = admins.map((admin) => ({
        recipient: admin._id,
        type,
        message,
        relatedEntityId
      }));
      await Notification.insertMany(docs);
      console.log(`🔔 ${docs.length} notification(s) [${type}] générée(s) pour l'administration.`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la génération de la notification administrateur :', error);
  }
};

/**
 * @desc    Obtenir la liste des notifications de l'administrateur connecté
 * @route   GET /api/notifications
 * @access  Private (Admin requis)
 */
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return res.status(200).json({
      unreadCount,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications :', error);
    return res.status(500).json({
      message: 'Erreur lors du chargement des notifications.'
    });
  }
};

/**
 * @desc    Marquer une notification spécifique comme lue
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (Admin requis)
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée.' });
    }

    return res.status(200).json({
      message: 'Notification marquée comme lue.',
      notification
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour de la notification.'
    });
  }
};

/**
 * @desc    Marquer toutes les notifications comme lues
 * @route   PATCH /api/notifications/read-all
 * @access  Private (Admin requis)
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      message: 'Toutes les notifications ont été marquées comme lues.'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors du traitement des notifications.'
    });
  }
};

module.exports = {
  triggerAdminNotification,
  getAdminNotifications,
  markAsRead,
  markAllAsRead
};
