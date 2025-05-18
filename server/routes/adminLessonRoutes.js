const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const adminLessonController = require('../controllers/adminLessonController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { validateRequest } = require('../middleware/errorHandler');

// Validation middleware
const lessonValidation = [
  check('title')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  check('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary cannot exceed 500 characters'),
  check('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  check('category')
    .isIn([
      'Algebra',
      'Calculus',
      'Geometry',
      'Trigonometry',
      'Statistics',
      'Pre-Calculus',
      'Number Theory',
      'Linear Algebra',
      'Differential Equations',
      'Other'
    ])
    .withMessage('Invalid category'),
  check('difficulty')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid difficulty level'),
  check('estimatedTime')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Estimated time cannot exceed 50 characters'),
  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  check('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  check('isPublished')
    .optional()
    .isBoolean()
    .withMessage('Published status must be a boolean'),
  check('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  check('prerequisites.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid prerequisite lesson ID'),
  check('relatedLessons')
    .optional()
    .isArray()
    .withMessage('Related lessons must be an array'),
  check('relatedLessons.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid related lesson ID'),
  check('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  check('resources.*.title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Resource title is required'),
  check('resources.*.type')
    .optional()
    .isIn(['video', 'document', 'link', 'exercise'])
    .withMessage('Invalid resource type'),
  check('resources.*.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid resource URL'),
  check('resources.*.description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Resource description cannot exceed 200 characters')
];

// Query validation middleware
const queryValidation = [
  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  check('sort')
    .optional()
    .matches(/^[a-zA-Z]+(,[a-zA-Z]+)*$/)
    .withMessage('Invalid sort format'),
  check('fields')
    .optional()
    .matches(/^[a-zA-Z]+(,[a-zA-Z]+)*$/)
    .withMessage('Invalid fields format'),
  check('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters long')
];

// Routes
router.use(protect, isAdmin); // Protect all admin routes

router
  .route('/lessons')
  .post(lessonValidation, validateRequest, adminLessonController.createLesson)
  .get(queryValidation, validateRequest, adminLessonController.getLessons);

router
  .route('/lessons/:id')
  .get(adminLessonController.getLesson)
  .put(lessonValidation, validateRequest, adminLessonController.updateLesson)
  .delete(adminLessonController.deleteLesson);

router.post('/media/upload', adminLessonController.uploadMedia);

module.exports = router; 