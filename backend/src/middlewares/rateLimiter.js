// Rate limiter in-memory store for comment creation and reaction spam protection
const requestLogs = new Map();

/**
 * Factory function to create custom rate limiters per IP/User
 * @param {Object} options { windowMs, maxRequests, message }
 */
const createRateLimiter = ({ windowMs = 60000, maxRequests = 5, message = 'Too many requests' }) => {
  return (req, res, next) => {
    const identifier = req.user ? req.user._id.toString() : req.ip;
    const key = `${req.path}_${identifier}`;
    const now = Date.now();

    if (!requestLogs.has(key)) {
      requestLogs.set(key, []);
    }

    const timestamps = requestLogs.get(key).filter((timestamp) => now - timestamp < windowMs);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({
        message,
        retryAfterSeconds: Math.ceil((windowMs - (now - timestamps[0])) / 1000)
      });
    }

    timestamps.push(now);
    requestLogs.set(key, timestamps);
    return next();
  };
};

const commentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 6,      // max 6 comments per minute
  message: 'You are commenting too quickly. Please wait a minute before posting again.'
});

const reactionRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 25,     // max 25 reactions per minute
  message: 'Too many reactions submitted. Please slow down.'
});

module.exports = {
  commentRateLimiter,
  reactionRateLimiter
};
