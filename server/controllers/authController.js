const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Generate JWT token with user ID and role
 * @param {String} userId - User's MongoDB ID
 * @param {String} role - User's role
 * @returns {String} JSON Web Token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId, 
      role,
      iat: Math.floor(Date.now() / 1000)
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists (double check even with validation)
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() }, 
        { username: username.toLowerCase() }
      ] 
    });
    
    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return next(new ApiError(400, 'Email already in use'));
      } else {
        return next(new ApiError(400, 'Username already taken'));
      }
    }

    // Create new user with sanitized data
    const user = new User({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      role: 'user', // Force regular user role for security (only admins can create other admins)
      lastLogin: new Date()
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Set last login time
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    // Return success with user data and token
    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // Check if user is banned
    if (user.isBanned) {
      return next(new ApiError(403, 'Your account has been banned. Please contact support.'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ApiError(403, 'Your account is inactive. Please contact support.'));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login time
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    // Set secure HTTP-only cookie in production
    if (process.env.NODE_ENV === 'production') {
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      });
    }

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req by the protect middleware
    // Just return the public profile
    res.json({
      status: 'success',
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updatePreferences = async (req, res, next) => {
  try {
    const { language, theme, notifications } = req.body;
    const userId = req.user._id;

    // Update only allowed fields using findByIdAndUpdate for atomicity
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'preferences.language': language || req.user.preferences.language,
          'preferences.theme': theme || req.user.preferences.theme,
          ...(notifications !== undefined && { 'preferences.notifications': notifications })
        }
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run Mongoose validation
      }
    );

    if (!updatedUser) {
      return next(new ApiError(404, 'User not found'));
    }

    res.json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        user: updatedUser.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = (req, res) => {
  // Clear the cookie if it exists
  if (req.cookies && req.cookies.token) {
    res.clearCookie('token');
  }
  
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
}; 