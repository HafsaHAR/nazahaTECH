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
      extraFields: processedExtraFields
    });

    return res.status(201).json({
      message: 'Challenge created successfully.',
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
 * @desc    Toggle Bookmark / Save Challenge for user (Single Source of Truth in User.savedChallenges)
 * @route   POST /api/challenges/:id/bookmark
 * @access  Private (JWT required)
 */
const toggleBookmark = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ message: 'Invalid Challenge ID.' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    const user = await User.findById(userId);
    const savedArray = user.savedChallenges || [];

    const isCurrentlySaved = savedArray.some(
      (savedId) => savedId.toString() === challengeId.toString()
    );

    if (isCurrentlySaved) {
      await User.findByIdAndUpdate(userId, {
        $pull: { savedChallenges: challengeId }
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedChallenges: challengeId }
      });
    }

    const updatedUser = await User.findById(userId);
    const isSavedNow = updatedUser.savedChallenges.some(
      (savedId) => savedId.toString() === challengeId.toString()
    );

    return res.status(200).json({
      message: isSavedNow ? 'Challenge saved to your bookmarks.' : 'Challenge removed from your bookmarks.',
      isSaved: isSavedNow
    });

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({
      message: 'Server error while toggling bookmark.',
      error: error.message
    });
  }
};

/**
 * @desc    Get filtered, sorted, and paginated challenges
 * @route   GET /api/challenges?search=&status=&sort=&category=&page=&limit=
 * @access  Public
 */
const getChallenges = async (req, res) => {
  try {
    const {
      search = '',
      status = 'all',
      sort = 'recent',
      category = 'Toutes',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'Toutes' && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { participantsCount: -1, createdAt: -1 };
    } else if (sort === 'ending_soon') {
      sortOptions = { deadline: 1 };
    } else if (sort === 'recent') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Challenge.countDocuments(filter);
    const challenges = await Challenge.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // If user is authenticated, compute isSaved dynamically
    let savedChallengesArray = [];
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      if (currentUser) savedChallengesArray = currentUser.savedChallenges || [];
    }

    const formattedChallenges = challenges.map((c) => formatChallenge(c, savedChallengesArray));

    return res.status(200).json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
      challenges: formattedChallenges
    });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    return res.status(500).json({
      message: 'Server error while fetching challenges.',
      error: error.message
    });
  }
};

/**
 * @desc    Get single challenge by ID
 * @route   GET /api/challenges/:id
 * @access  Public
 */
const getChallengeById = async (req, res) => {
  try {
    const challengeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(404).json({ message: 'Invalid Challenge ID format.' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    let savedChallengesArray = [];
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      if (currentUser) savedChallengesArray = currentUser.savedChallenges || [];
    }

    return res.status(200).json({
      challenge: formatChallenge(challenge, savedChallengesArray)
    });

  } catch (error) {
    console.error('Error fetching challenge by ID:', error);
    return res.status(500).json({
      message: 'Server error while fetching challenge.',
      error: error.message
    });
  }
};

module.exports = {
  createChallenge,
  toggleBookmark,
  getChallenges,
  getChallengeById
};
