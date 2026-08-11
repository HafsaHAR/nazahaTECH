const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware pour protéger les routes nécessitant une authentification JWT.
 * Lit le header Authorization ('Bearer <token>'), le vérifie et attache l'utilisateur à req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Vérification de la présence du header Authorization au format 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraction de la chaîne du token
      token = req.headers.authorization.split(' ')[1];

      // 2. Vérification et décodage de la clé JWT
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'nazahatech_jwt_secret_key_2026'
      );

      // 3. Récupération de l'utilisateur en BDD (exclut le mot de passe) et attachement à req.user
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          message: 'Non autorisé, utilisateur introuvable.'
        });
      }

      return next();
    } catch (error) {
      console.error('Erreur de vérification du token JWT :', error.message);
      return res.status(401).json({
        message: 'Non autorisé, token invalide ou expiré.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: 'Non autorisé, aucun token fourni.'
    });
  }
};

/**
 * Middleware de contrôle d'accès basé sur les rôles (ex: admin, inspector)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès interdit : le rôle '${req.user ? req.user.role : 'anonyme'}' n'a pas les permissions requises.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
