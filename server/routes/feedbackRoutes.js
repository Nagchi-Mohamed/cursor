const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus
} = require('../controllers/feedbackController');

/**
 * Middleware to handle validation errors
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * POST /api/v1/feedback - Create new feedback
 * Authentication is optional - logged in users will have their ID attached
 */
router.post(
  '/',
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Feedback message is required')
      .isString()
      .withMessage('Message must be a string')
      .isLength({ min: 3, max: 5000 })
      .withMessage('Feedback message must be between 3 and 5000 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage('Email cannot exceed 100 characters'),
    
    body('context')
      .optional()
      .isObject()
      .withMessage('Context must be an object'),
    
    body('context.page')
      .optional()
      .isString()
      .withMessage('Page context must be a string')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Page name cannot exceed 100 characters'),
    
    body('context.lessonId')
      .optional()
      .isMongoId()
      .withMessage('Invalid lesson ID format'),
    
    body('context.practiceSetId')
      .optional()
      .isMongoId()
      .withMessage('Invalid practice set ID format'),

    // Ensure no other unexpected fields are submitted
    body()
      .custom(body => {
        const allowedFields = ['message', 'email', 'context'];
        const receivedFields = Object.keys(body);
        
        for (const field of receivedFields) {
          if (!allowedFields.includes(field)) {
            throw new Error(`Field '${field}' is not allowed`);
          }
        }
        
        if (body.context) {
          const allowedContextFields = ['page', 'lessonId', 'practiceSetId'];
          const receivedContextFields = Object.keys(body.context);
          
          for (const field of receivedContextFields) {
            if (!allowedContextFields.includes(field)) {
              throw new Error(`Context field '${field}' is not allowed`);
            }
          }
        }
        
        return true;
      })
  ],
  validateRequest,
  optionalAuth,  // Use optional auth to attach user ID if available
  createFeedback
);

/**
 * GET /api/v1/feedback - Get all feedback (admin only)
 */
router.get(
  '/',
  [
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
      .withMessage('sortOrder must be either asc or desc')
  ],
  validateRequest,
  protect,  // Must be authenticated
  isAdmin,  // Must be admin
  getAllFeedback
);

/**
 * GET /api/v1/feedback/:id - Get feedback by ID (admin only)
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid feedback ID format')
  ],
  validateRequest,
  protect,
  isAdmin,
  getFeedbackById
);

/**
 * PATCH /api/v1/feedback/:id/status - Update feedback status (admin only)
 */
router.patch(
  '/:id/status',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid feedback ID format'),
    
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isString()
      .withMessage('Status must be a string')
      .trim()
      .isIn(['New', 'Read', 'In Progress', 'Resolved', 'Archived'])
      .withMessage('Invalid feedback status - must be one of: New, Read, In Progress, Resolved, Archived'),
    
    // Ensure only status field is submitted
    body()
      .custom(body => {
        const receivedFields = Object.keys(body);
        if (receivedFields.length !== 1 || !receivedFields.includes('status')) {
          throw new Error('Only status field can be updated');
        }
        return true;
      })
  ],
  validateRequest,
  protect,
  isAdmin,
  updateFeedbackStatus
);

module.exports = router; 