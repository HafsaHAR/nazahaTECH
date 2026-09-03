const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

/**
 * Compute dynamic status based on current date and challenge timeline
 */
const getComputedStatus = (challenge) => {
  const now = new Date();
  const start = challenge.startDate ? new Date(challenge.startDate) : new Date(challenge.createdAt);
  const end = challenge.endDate ? new Date(challenge.endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'open';
  return 'closed';
};

/**
 * Helper to format challenge response with computed properties and sorted extraFields
 */
const formatChallenge = (challengeDoc, savedChallengesArray = []) => {
  const obj = challengeDoc.toObject ? challengeDoc.toObject() : challengeDoc;
  const challengeIdStr = obj._id.toString();

  const isSaved = savedChallengesArray.some(
    (id) => id.toString() === challengeIdStr
  );

  const sortedExtraFields = (obj.extraFields || []).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return {
    ...obj,
    computedStatus: getComputedStatus(obj),
    isSaved,
    extraFields: sortedExtraFields
  };
};

/**
 * @desc    Create a new challenge (Admin only)
 * @route   POST /api/challenges
 * @access  Private (Admin required)
 */
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      reward,
      duration,
      startDate,
      endDate,
      deadline,
      locationMode,
      locationAddress,
      maxParticipants,
      organization,
      extraFields
    } = req.body;

    // 1. Mandatory Fields Validation
    if (!title || !description || !category || !startDate || !endDate || !deadline) {
      return res.status(400).json({
        message: 'Please provide all mandatory fields (title, description, category, startDate, endDate, deadline).'
      });
    }

    // 2. Strict Date Chronology Validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dead = new Date(deadline);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(dead.getTime())) {
      return res.status(400).json({ message: 'Invalid date format provided.' });
    }

    if (end <= start) {
      return res.status(400).json({
        message: 'End date must be strictly after the start date.'
      });
    }

    if (dead > start) {
      return res.status(400).json({
        message: 'Application deadline must be on or before the challenge start date.'
      });
    }

    // 3. Extra Fields Sanitization & Ordering
    let processedExtraFields = [];
    if (Array.isArray(extraFields)) {
      processedExtraFields = extraFields
        .filter((field) => field && field.title && field.content)
        .map((field, idx) => ({
          title: field.title.trim(),
          content: field.content.trim(),
          order: typeof field.order === 'number' ? field.order : idx + 1
        }));
    }

    const challenge = await Challenge.create({
      title: title.trim(),
      description: description.trim(),
      category,
      reward: reward ? reward.trim() : '50 000 MAD + accompagnement',
      duration: duration ? duration.trim() : '4 semaines',
      startDate: start,
      endDate: end,
      deadline: dead,
      locationMode: locationMode === 'onsite' ? 'onsite' : 'remote',
      locationAddress: locationAddress ? locationAddress.trim() : '',
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : 100,
      organization: organization ? organization.trim() : 'INPPLC',
      createdBy: req.user._id,
      extraFields: processedExtraFields
    });

    return res.status(201).json({
      message: 'Défi créé avec succès et enregistré dans la base de données.',
      challenge: formatChallenge(challenge)
    });

  } catch (error) {
    console.error('Error creating challenge:', error);
    return res.status(500).json({
      message: 'Server error while creating challenge.',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle Bookmark Challenge (Favorite)
 * @route   POST /api/challenges/:id/bookmark
 * @access  Private
 */
const toggleBookmark = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ message: 'Invalid challenge ID.' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    const user = await User.findById(userId);
    const isSaved = user.savedChallenges.some(
      (id) => id.toString() === challengeId
    );

    if (isSaved) {
      user.savedChallenges = user.savedChallenges.filter(
        (id) => id.toString() !== challengeId
      );
    } else {
      user.savedChallenges.push(challengeId);
    }

    await user.save();

    return res.status(200).json({
      message: isSaved ? 'Défi retiré des favoris.' : 'Défi sauvegardé dans vos favoris.',
      isSaved: !isSaved
    });

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({ message: 'Server error while toggling bookmark.' });
  }
};

/**
 * @desc    Get all challenges with multi-criteria filtering
 * @route   GET /api/challenges
 * @access  Public (Optional auth for isSaved status)
 */
const getChallenges = async (req, res) => {
  try {
    const { status, search, category, sort } = req.query;
    const query = {};

    if (category && category !== 'Toutes' && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    let sortOptions = { startDate: -1 };
    if (sort === 'popular') {
      sortOptions = { participantsCount: -1, startDate: -1 };
    } else if (sort === 'ending_soon') {
      sortOptions = { endDate: 1 };
    } else if (sort === 'recent') {
      sortOptions = { createdAt: -1 };
    }

    const challengesDoc = await Challenge.find(query).sort(sortOptions);

    let savedChallengesArray = [];
    if (req.user) {
      const user = await User.findById(req.user._id).select('savedChallenges');
      if (user) savedChallengesArray = user.savedChallenges || [];
    }

    let formattedChallenges = challengesDoc.map((doc) =>
      formatChallenge(doc, savedChallengesArray)
    );

    if (status && status !== 'all') {
      const targetStatus = status.toLowerCase();
      formattedChallenges = formattedChallenges.filter((c) => {
        const computed = c.computedStatus.toLowerCase();
        const rawStatus = (c.status || '').toLowerCase();

        if (targetStatus === 'open' || targetStatus === 'ouvert') {
          return computed === 'open' || rawStatus === 'open' || rawStatus === 'ouvert';
        }
        if (targetStatus === 'in_progress' || targetStatus === 'en_cours') {
          return computed === 'open' || rawStatus === 'in_progress' || rawStatus === 'en_cours';
        }
        if (targetStatus === 'closed' || targetStatus === 'cloture') {
          return computed === 'closed' || rawStatus === 'closed' || rawStatus === 'cloture';
        }
        return computed === targetStatus || rawStatus === targetStatus;
      });
    }

    return res.status(200).json({
      count: formattedChallenges.length,
      challenges: formattedChallenges
    });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    return res.status(500).json({ message: 'Server error while fetching challenges.' });
  }
};

/**
 * @desc    Get single challenge by ID
 * @route   GET /api/challenges/:id
 * @access  Public (Optional auth for isSaved status)
 */
const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid challenge ID format.' });
    }

    const challengeDoc = await Challenge.findById(id);

    if (!challengeDoc) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    let savedChallengesArray = [];
    if (req.user) {
      const user = await User.findById(req.user._id).select('savedChallenges');
      if (user) savedChallengesArray = user.savedChallenges || [];
    }

    return res.status(200).json({
      challenge: formatChallenge(challengeDoc, savedChallengesArray)
    });

  } catch (error) {
    console.error('Error fetching challenge by ID:', error);
    return res.status(500).json({ message: 'Server error while fetching challenge details.' });
  }
};

module.exports = {
  createChallenge,
  toggleBookmark,
  getChallenges,
  getChallengeById
};
