const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'nazahatech_jwt_secret_key_2026'
      );

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
