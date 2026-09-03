const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const Challenge = require('../models/Challenge');
const Participation = require('../models/Participation');
const ChallengeSubmission = require('../models/ChallengeSubmission');

const JWT_SECRET = process.env.JWT_SECRET || 'nazahatech_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const formatUserResponse = (user) => {
  const nameParts = (user.name || '').trim().split(' ');
  const firstName = user.firstName || nameParts[0] || '';
  const lastName = user.lastName || nameParts.slice(1).join(' ') || '';

  return {
    _id: user._id,
    id: user._id,
    firstName,
    lastName,
    name: user.name || `${firstName} ${lastName}`.trim(),
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    role: user.role,
    avatar: user.avatar || '',
    createdAt: user.createdAt
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, phoneNumber } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'L\'email et le mot de passe sont obligatoires.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        message: 'Cet email est déjà utilisé. Veuillez vous connecter.'
      });
    }

    const finalFirstName = firstName ? firstName.trim() : (name ? name.split(' ')[0] : 'Membre');
    const finalLastName = lastName ? lastName.trim() : (name ? name.split(' ').slice(1).join(' ') : 'INPPLC');
    const fullName = `${finalFirstName} ${finalLastName}`.trim();

    const newUser = await User.create({
      name: fullName,
      firstName: finalFirstName,
      lastName: finalLastName,
      email: cleanEmail,
      password: password,
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      role: 'user'
    });

    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      message: 'Compte créé avec succès !',
      token,
      user: formatUserResponse(newUser)
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
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Veuillez saisir votre email et votre mot de passe.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

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
 * @desc    Update user profile
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

    const [ideasCount, commentsCount, createdChallengesCount, votedIdeasCount, likedCommentsCount] = await Promise.all([
      Idea.countDocuments({ author: userId }),
      Comment.countDocuments({ author: userId, isDeleted: false }),
      Challenge.countDocuments({ createdBy: userId }),
      Idea.countDocuments({ voters: userId }),
      Comment.countDocuments({ 'reactions.like': userId })
    ]);

    const user = await User.findById(userId);
    const savedChallengesCount = user?.savedChallenges?.length || 0;
    const totalChallenges = createdChallengesCount + savedChallengesCount;
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
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { author: req.user._id },
        { createdBy: req.user._id }
      ]
    };

    const total = await Idea.countDocuments(filter);
    const ideas = await Idea.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
      ideas
    });
  } catch (error) {
    console.error('❌ Erreur getUserIdeas :', error);
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
 * @desc    Get paginated user challenges (Created + Bookmarked)
 * @route   GET /api/users/me/challenges?page=1&limit=5
 * @access  Private
 */
const getUserChallenges = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const createdChallenges = await Challenge.find({ createdBy: req.user._id });
    const user = await User.findById(req.user._id).populate('savedChallenges');
    const saved = user?.savedChallenges || [];

    const combinedMap = new Map();
    createdChallenges.forEach((c) => combinedMap.set(c._id.toString(), c));
    saved.forEach((c) => {
      if (c && c._id) combinedMap.set(c._id.toString(), c);
    });

    const allUserChallenges = Array.from(combinedMap.values());
    const total = allUserChallenges.length;
    const paginatedChallenges = allUserChallenges.slice(skip, skip + limit);

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
 * @desc    Get paginated user interactions
 * @route   GET /api/users/me/interactions?page=1&limit=5
 * @access  Private
 */
const getUserInteractions = async (req, res) => {
  try {
    const votedIdeas = await Idea.find({ voters: req.user._id }).select('title category createdAt');
    return res.status(200).json({
      total: votedIdeas.length,
      interactions: votedIdeas
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur chargement de vos interactions.' });
  }
};

/**
 * @desc    Get challenge submissions for participant
 * @route   GET /api/users/me/challenge-submissions
 * @access  Private
 */
const getParticipantChallengeSubmissions = async (req, res) => {
  try {
    const submissions = await ChallengeSubmission.find({ userId: req.user._id })
      .populate('challengeId', 'title category organization status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: submissions.length,
      submissions
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur chargement de vos soumissions aux défis.' });
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
  getUserInteractions,
  getParticipantChallengeSubmissions
};
