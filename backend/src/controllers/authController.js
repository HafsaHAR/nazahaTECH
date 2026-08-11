const User = require('../models/User');
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const Challenge = require('../models/Challenge');
const Participation = require('../models/Participation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Génère un jeton JWT d'authentification
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'nazahatech_jwt_secret_key_2026',
    { expiresIn: '7d' }
  );
};

/**
 * Helper to ensure a clean display name without undefined values
 */
const formatUserResponse = (userDoc) => {
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  let firstName = obj.firstName || '';
  let lastName = obj.lastName || '';

  if ((!firstName || firstName === 'undefined') && (!lastName || lastName === 'undefined')) {
    const emailPrefix = (obj.email || '').split('@')[0] || 'Membre';
    firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    lastName = 'INPPLC';
  }

  const fullName = `${firstName} ${lastName}`.trim();

  return {
    _id: obj._id,
    firstName,
    lastName,
    name: fullName,
    email: obj.email,
    phoneNumber: obj.phoneNumber || '',
    role: obj.role || 'user',
    savedChallenges: obj.savedChallenges || [],
    createdAt: obj.createdAt
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      confirmEmail,
      phoneNumber,
      password,
      confirmPassword
    } = req.body;

    if (!firstName || !lastName || !email || !confirmEmail || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Veuillez remplir tous les champs obligatoires.'
      });
    }

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      return res.status(400).json({
        message: 'L\'adresse email et la confirmation d\'email ne correspondent pas.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Le mot de passe et sa confirmation ne correspondent pas.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'Un utilisateur avec cet email existe déjà.'
      });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      password: password,
      role: 'user'
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la création du compte.',
      error: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Veuillez fournir votre email et mot de passe.'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        message: 'Identifiants invalides (email ou mot de passe incorrect).'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Identifiants invalides (email ou mot de passe incorrect).'
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la connexion.',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la récupération du profil.'
    });
  }
};

/**
 * @desc    Update user profile with validation & sanitization
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    if (firstName && firstName.trim().length < 2) {
      return res.status(400).json({ message: 'Le prénom doit contenir au moins 2 caractères.' });
    }

    if (lastName && lastName.trim().length < 2) {
      return res.status(400).json({ message: 'Le nom doit contenir au moins 2 caractères.' });
    }

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName.trim();
    if (lastName) updateFields.lastName = lastName.trim();
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Profil mis à jour avec succès.',
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    console.error('Erreur mise à jour profil :', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
  }
};

/**
 * @desc    Get lightweight summary counts for profile overview
 * @route   GET /api/auth/activity/summary
 * @access  Private
 */
const getActivitySummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [ideasCount, commentsCount, participationsCount, votedIdeasCount, likedCommentsCount] = await Promise.all([
      Idea.countDocuments({ author: userId }),
      Comment.countDocuments({ author: userId, isDeleted: false }),
      Participation.countDocuments({ userId }),
      Idea.countDocuments({ voters: userId }),
      Comment.countDocuments({ 'reactions.like': userId })
    ]);

    const user = await User.findById(userId);
    const savedChallengesCount = user?.savedChallenges?.length || 0;
    const totalChallenges = participationsCount + savedChallengesCount;
    const totalInteractions = votedIdeasCount + likedCommentsCount;

    return res.status(200).json({
      summary: {
        ideasCount,
        commentsCount,
        challengesCount: totalChallenges,
        interactionsCount: totalInteractions
      }
    });

  } catch (error) {
    console.error('Erreur résumé activité :', error);
    return res.status(500).json({ message: 'Erreur chargement du résumé d\'activité.' });
  }
};

/**
 * @desc    Get paginated ideas submitted by current user
 * @route   GET /api/users/me/ideas?page=1&limit=5
 * @access  Private
 */
const getUserIdeas = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const total = await Idea.countDocuments({ author: req.user._id });
    const ideas = await Idea.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      ideas
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur chargement de vos idées.' });
  }
};

/**
 * @desc    Get paginated comments written by current user
 * @route   GET /api/users/me/comments?page=1&limit=5
 * @access  Private
 */
const getUserComments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const total = await Comment.countDocuments({ author: req.user._id });
    const comments = await Comment.find({ author: req.user._id })
      .populate('ideaId', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      comments
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur chargement de vos commentaires.' });
  }
};

/**
 * @desc    Get paginated user challenges (participations & bookmarked)
 * @route   GET /api/users/me/challenges?page=1&limit=5
 * @access  Private
 */
const getUserChallenges = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id).populate('savedChallenges');
    const saved = user?.savedChallenges || [];

    const total = saved.length;
    const paginatedChallenges = saved.slice(skip, skip + limit);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      challenges: paginatedChallenges
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur chargement de vos défis.' });
  }
};

/**
 * @desc    Get paginated user interactions (voted ideas & liked comments)
 * @route   GET /api/users/me/interactions?page=1&limit=5
 * @access  Private
 */
const getUserInteractions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);

    const [votedIdeas, likedComments] = await Promise.all([
      Idea.find({ voters: req.user._id }).sort({ updatedAt: -1 }).limit(10),
      Comment.find({ 'reactions.like': req.user._id }).populate('ideaId', 'title').sort({ updatedAt: -1 }).limit(10)
    ]);

    const interactions = [
      ...votedIdeas.map((i) => ({
        _id: i._id,
        type: 'idea_vote',
        title: `Vote sur l'idée "${i.title}"`,
        category: i.category,
        date: i.updatedAt || i.createdAt
      })),
      ...likedComments.map((c) => ({
        _id: c._id,
        type: 'comment_like',
        title: `J'aime sur le commentaire : "${c.content.substring(0, 40)}..."`,
        category: 'Commentaire',
        date: c.updatedAt || c.createdAt
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = interactions.length;
    const skip = (page - 1) * limit;
    const paginatedInteractions = interactions.slice(skip, skip + limit);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      interactions: paginatedInteractions
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur chargement de vos interactions.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getActivitySummary,
  getUserIdeas,
  getUserComments,
  getUserChallenges,
  getUserInteractions
};
