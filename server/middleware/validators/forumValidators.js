const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a new thread
 */
exports.createThreadRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['general', 'help', 'discussion', 'announcement'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 5) {
        throw new Error('Maximum 5 tags allowed');
      }
      return true;
    })
];

/**
 * Validation rules for creating a new post
 */
exports.createPostRules = [
  param('threadId')
    .isMongoId()
    .withMessage('Invalid thread ID'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1 })
    .withMessage('Content cannot be empty'),
  
  body('parentPost')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent post ID')
];

/**
 * Validation rules for updating a post
 */
exports.updatePostRules = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1 })
    .withMessage('Content cannot be empty')
];

/**
 * Validation rules for thread listing
 */
exports.getThreadsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isIn(['general', 'help', 'discussion', 'announcement'])
    .withMessage('Invalid category'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long')
];

/**
 * Validation rules for getting posts
 */
exports.getPostsRules = [
  param('threadId')
    .isMongoId()
    .withMessage('Invalid thread ID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation rules for post actions (like, solution)
 */
exports.postActionRules = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID')
]; 