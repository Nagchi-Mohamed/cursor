const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const { ApiError } = require('./errorHandler');

/**
 * MongoDB-backed rate limiter store
 * Uses database to track rate limits across multiple server instances
 */
const mongoStore = new MongoStore({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mathsphere',
  collectionName: 'rate_limits',
  expireTimeMs: 60 * 60 * 1000, // 1 hour in milliseconds
  errorHandler: console.error
});

/**
 * Creates a new rate limiter middleware
 * 
 * @param {Object} options - Rate limiter options
 * @param {number} [options.windowMs=15*60*1000] - Time window in milliseconds
 * @param {number} [options.max=100] - Max requests per IP within windowMs
 * @param {string} [options.message='Too many requests, please try again later'] - Error message
 * @param {string} [options.type='general'] - Rate limit type for logging
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later',
    type = 'general'
  } = options;

  return rateLimit({
    store: mongoStore,
    windowMs,
    max,
    message,
    headers: true,
    handler: (req, res, next) => {
      console.warn(`Rate limit exceeded (${type}): ${req.ip}`);
      next(new ApiError(429, message));
    },
    // Try to identify real client IP behind proxies/load balancers
    keyGenerator: (req) => {
      return req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.ip;
    }
  });
};

// General API rate limiter - used for most routes
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes',
  type: 'api'
});

// Authentication rate limiter - more strict for security
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 login/register attempts per IP per hour
  message: 'Too many authentication attempts, please try again after an hour',
  type: 'auth'
});

// Admin actions rate limiter - allow more admin actions
const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP per 15 minutes for admin actions
  message: 'Too many admin requests, please try again after 15 minutes',
  type: 'admin'
});

// Content creation rate limiter
const contentCreationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 content creation requests per IP per hour
  message: 'You are creating content too quickly. Please try again later.',
  type: 'content'
});

// Solver API rate limiter - protect expensive computation
const solverLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 solver requests per IP per hour
  message: 'Too many solver requests. Please try again later.',
  type: 'solver'
});

// Account protection rate limiter - password reset, etc.
const accountLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 account operations per IP per day
  message: 'Too many account operations. Please try again tomorrow.',
  type: 'account'
});

module.exports = {
  apiLimiter,
  authLimiter,
  adminLimiter,
  contentCreationLimiter,
  solverLimiter,
  accountLimiter,
  createRateLimiter // Export the factory function for custom limiters
}; 