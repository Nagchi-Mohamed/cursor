const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to authenticate users via JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  const authHeader = req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError('Access denied. No authentication token provided.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new ApiError('User no longer exists.', 401));
  }

  // Check if user is banned
  if (user.isBanned) {
    return next(new ApiError('Your account has been banned. Please contact support.', 403));
  }

  // Check if user is inactive
  if (!user.isActive) {
    return next(new ApiError('Your account is inactive. Please contact support.', 403));
  }

  // 4) Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new ApiError('User recently changed password. Please log in again.', 401));
  }

  // 5) Update last login if it's been more than 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (!user.lastLogin || user.lastLogin < oneHourAgo) {
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
  }

  // Grant access to protected route
  req.user = user;
  req.token = token;
  next();
});

const isAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      new ApiError(403, 'You do not have permission to perform this action')
    );
  }
  next();
});

const isEditorOrAdmin = catchAsync(async (req, res, next) => {
  if (!['admin', 'editor'].includes(req.user.role)) {
    return next(new ApiError('Access denied. Editor or admin privileges required.', 403));
  }
  next();
});

/**
 * Simplified version of auth middleware for public routes that need optional authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  try {
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // If token is invalid, continue without user
  }
  next();
});

module.exports = {
  protect,
  isAdmin,
  isEditorOrAdmin,
  optionalAuth
};
