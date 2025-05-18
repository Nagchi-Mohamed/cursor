const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Middleware to validate query parameters for listing users
 */
const validateListUsersQuery = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer between 1 and 1000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('keyword')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Keyword cannot exceed 100 characters')
    .escape(),
  
  query('role')
    .optional()
    .isString()
    .trim()
    .isIn(['user', 'editor', 'admin'])
    .withMessage('Role must be one of: user, editor, admin'),
  
  query('isBanned')
    .optional()
    .isBoolean({ loose: true })
    .withMessage('isBanned must be true or false')
    .toBoolean(true),
  
  query('isActive')
    .optional()
    .isBoolean({ loose: true })
    .withMessage('isActive must be true or false')
    .toBoolean(true),
  
  query('sortBy')
    .optional()
    .isString()
    .trim()
    .isIn(['createdAt', 'username', 'email', 'role', 'lastLogin'])
    .withMessage('sortBy must be one of: createdAt, username, email, role, lastLogin'),
  
  query('sortOrder')
    .optional()
    .isString()
    .trim()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }
    
    // Sanitize and set defaults
    if (!req.query.page) req.query.page = 1;
    if (!req.query.limit) req.query.limit = 10;
    if (!req.query.sortBy) req.query.sortBy = 'createdAt';
    if (!req.query.sortOrder) req.query.sortOrder = 'desc';
    
    next();
  }
];

/**
 * Middleware to validate user ID parameter
 */
const validateUserIdParam = [
  param('userId')
    .exists()
    .withMessage('User ID is required')
    .notEmpty()
    .withMessage('User ID cannot be empty')
    .isString()
    .withMessage('User ID must be a string')
    .trim()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Middleware to validate user updates by admin
 */
const validateUpdateUserByAdmin = [
  body('role')
    .optional()
    .isString()
    .trim()
    .isIn(['user', 'editor', 'admin'])
    .withMessage('Role must be one of: user, editor, admin'),
  
  body('isBanned')
    .optional()
    .isBoolean({ loose: true })
    .withMessage('isBanned must be true or false')
    .toBoolean(true),
  
  body('isActive')
    .optional()
    .isBoolean({ loose: true })
    .withMessage('isActive must be true or false')
    .toBoolean(true),
    
  // Explicitly disallow any other fields for security
  body()
    .custom(body => {
      const allowedFields = ['role', 'isBanned', 'isActive'];
      const receivedFields = Object.keys(body);
      
      for (const field of receivedFields) {
        if (!allowedFields.includes(field)) {
          throw new Error(`Field '${field}' is not allowed. Only role, isBanned, and isActive can be updated.`);
        }
      }
      
      return true;
    }),
  
  (req, res, next) => {
    // Check if at least one field to update is provided
    const updates = Object.keys(req.body);
    const allowedUpdates = ['role', 'isBanned', 'isActive'];
    const isValidOperation = updates.some(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update. Allowed fields: role, isBanned, isActive'
      });
    }
    
    // Prevent critical security issue: Admin self-demotion check
    if (req.body.role && req.body.role !== 'admin' && req.params.userId === req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You cannot demote yourself from admin role'
      });
    }
    
    // Prevent disabling the last admin account
    if ((req.body.isBanned === true || req.body.isActive === false) && 
        req.params.userId === req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You cannot ban or deactivate your own admin account'
      });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user data',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateListUsersQuery,
  validateUserIdParam,
  validateUpdateUserByAdmin
}; 