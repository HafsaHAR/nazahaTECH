const express = require('express');
const router = express.Router();
const {
  getAdminNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Toutes les routes de notifications nécessitent une authentification Admin
router.use(protect, authorize('admin'));

// Obtenir la liste des notifications et le décompte non-lu
router.get('/', getAdminNotifications);

// Marquer toutes les notifications comme lues
router.patch('/read-all', markAllAsRead);

// Marquer une notification spécifique comme lue
router.patch('/:id/read', markAsRead);

module.exports = router;
