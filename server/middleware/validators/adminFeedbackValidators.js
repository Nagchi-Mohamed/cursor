const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Middleware to validate query parameters for listing feedback
 */
const validateListFeedbackQuery = [
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
  
  query('status')
    .optional()
    .isString()
    .trim()
    .isIn(['New', 'Read', 'In Progress', 'Resolved', 'Archived'])
    .withMessage('Status must be one of: New, Read, In Progress, Resolved, Archived'),
  
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters')
    .escape(),
  
  query('sortBy')
    .optional()
    .isString()
    .trim()
    .isIn(['createdAt', 'status'])
    .withMessage('sortBy must be one of: createdAt, status'),
  
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
 * Middleware to validate feedback ID parameter
 */
const validateFeedbackIdParam = [
  param('feedbackId')
    .exists()
    .withMessage('Feedback ID is required')
    .notEmpty()
    .withMessage('Feedback ID cannot be empty')
    .isString()
    .withMessage('Feedback ID must be a string')
    .trim()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid feedback ID format');
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid feedback ID',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Middleware to validate feedback status update
 */
const validateFeedbackStatusUpdate = [
  body('status')
    .exists()
    .withMessage('Status is required')
    .notEmpty()
    .withMessage('Status cannot be empty')
    .isString()
    .withMessage('Status must be a string')
    .trim()
    .isIn(['New', 'Read', 'In Progress', 'Resolved', 'Archived'])
    .withMessage('Status must be one of: New, Read, In Progress, Resolved, Archived'),
  
  // Explicitly disallow any other fields to prevent injection
  body()
    .custom(body => {
      const allowedFields = ['status'];
      const receivedFields = Object.keys(body);
      
      for (const field of receivedFields) {
        if (!allowedFields.includes(field)) {
          throw new Error(`Field '${field}' is not allowed. Only 'status' can be updated.`);
        }
      }
      
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status update',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateListFeedbackQuery,
  validateFeedbackIdParam,
  validateFeedbackStatusUpdate
}; 