const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { param, query } = require('express-validator');
const { validateRequest } = require('../middleware/errorHandler');

// Validation middleware
const lessonValidation = [
  check('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  check('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  check('category')
    .isIn(['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Number Theory', 'Applied Mathematics'])
    .withMessage('Invalid category'),
  check('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid difficulty level'),
  check('estimatedDuration')
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive number'),
  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  check('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array')
];

const validateLessonIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lesson ID')
];

// Routes
router.post('/', protect, isAdmin, lessonValidation, lessonController.createLesson);
router.get('/', 
  query('category').optional().isString().trim().escape(),
  query('level').optional().isString().trim().escape(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim().escape(),
  validateRequest,
  lessonController.getLessons
);
router.get('/search', lessonController.searchLessons);
router.get('/category/:category', lessonController.getLessonsByCategory);
router.get('/:id', validateLessonIdParam, validateRequest, lessonController.getLesson);
router.put('/:id', protect, isAdmin, validateLessonIdParam, validateRequest, lessonController.updateLesson);
router.delete('/:id', protect, isAdmin, validateLessonIdParam, validateRequest, lessonController.deleteLesson);

module.exports = router; 