const { ApiError } = require('./errorHandler');
const User = require('../models/User');

/**
 * Middleware to check if the authenticated user is an admin
 * Must be used after the protect middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = async (req, res, next) => {
  try {
    // Ensure user exists in request (protect middleware must run first)
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required. Please login.'));
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return next(new ApiError(403, 'Access denied. Admin privileges required.'));
    }

    // Double-check admin status in database (in case role was changed in another session)
    // This adds extra security but could be removed for performance if necessary
    const freshUser = await User.findById(req.user._id);
    
    if (!freshUser) {
      return next(new ApiError(404, 'User no longer exists.'));
    }
    
    if (freshUser.role !== 'admin') {
      return next(new ApiError(403, 'Access denied. Your role has been changed. Please login again.'));
    }
    
    if (freshUser.isBanned) {
      return next(new ApiError(403, 'Your account has been banned. Please contact support.'));
    }
    
    if (!freshUser.isActive) {
      return next(new ApiError(403, 'Your account is inactive. Please contact support.'));
    }

    next();
  } catch (error) {
    next(new ApiError(500, 'Error verifying admin privileges.'));
  }
};

/**
 * Middleware to check if user is an editor or admin
 * Must be used after the protect middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isEditorOrAdmin = async (req, res, next) => {
  try {
    // Ensure user exists in request
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required. Please login.'));
    }

    // Check if user has editor or admin role
    if (req.user.role !== 'editor' && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Access denied. Editor or admin privileges required.'));
    }

    // Double-check role in database
    const freshUser = await User.findById(req.user._id);
    
    if (!freshUser) {
      return next(new ApiError(404, 'User no longer exists.'));
    }
    
    if (freshUser.role !== 'editor' && freshUser.role !== 'admin') {
      return next(new ApiError(403, 'Access denied. Your role has been changed. Please login again.'));
    }
    
    if (freshUser.isBanned) {
      return next(new ApiError(403, 'Your account has been banned. Please contact support.'));
    }
    
    if (!freshUser.isActive) {
      return next(new ApiError(403, 'Your account is inactive. Please contact support.'));
    }

    next();
  } catch (error) {
    next(new ApiError(500, 'Error verifying privileges.'));
  }
};

module.exports = {
  isAdmin,
  isEditorOrAdmin
}; 