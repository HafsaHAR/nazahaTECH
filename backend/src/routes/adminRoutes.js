const express = require('express');
const router = express.Router();
const { getAdminMetrics, getRejectedHistory } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Toutes les routes admin nécessitent une authentification avec le rôle admin
router.use(protect, authorize('admin'));

// Obtenir les métriques et agrégations du tableau de bord
router.get('/metrics', getAdminMetrics);

// Obtenir l'historique des idées rejetées (Réservé à l'Admin)
router.get('/history', getRejectedHistory);

module.exports = router;
