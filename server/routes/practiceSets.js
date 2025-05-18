const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const practiceSetController = require('../controllers/practiceSetController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { param, query, body } = require('express-validator');
const { validateRequest } = require('../middleware/errorHandler');

// Validation middleware
const practiceSetValidation = [
  check('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  check('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required'),
  check('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  check('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  check('questions.*.questionType')
    .isIn(['multiple-choice', 'short-answer', 'essay_mathjax'])
    .withMessage('Invalid question type'),
  check('questions.*.options')
    .if(check('questions.*.questionType').equals('multiple-choice'))
    .isArray({ min: 2 })
    .withMessage('Multiple choice questions must have at least 2 options'),
  check('questions.*.correctAnswer')
    .notEmpty()
    .withMessage('Correct answer is required'),
  check('questions.*.explanation')
    .trim()
    .notEmpty()
    .withMessage('Explanation is required'),
  check('questions.*.points')
    .isInt({ min: 1 })
    .withMessage('Points must be a positive number'),
  check('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive number'),
  check('attemptsAllowed')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Attempts allowed must be a positive number')
];

const submissionValidation = [
  check('answers')
    .isArray({ min: 1 })
    .withMessage('At least one answer is required'),
  check('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  check('answers.*.answer')
    .notEmpty()
    .withMessage('Answer is required')
];

const validatePracticeSetIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid practice set ID')
];

const validateSubmitAnswer = [
  body('answer')
    .exists()
    .withMessage('Answer is required'),
  
  body('questionId')
    .isMongoId()
    .withMessage('Invalid question ID')
];

// Routes
router.post('/', protect, isAdmin, practiceSetValidation, practiceSetController.createPracticeSet);
router.get('/', 
  query('category').optional().isString().trim().escape(),
  query('level').optional().isString().trim().escape(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim().escape(),
  validateRequest,
  practiceSetController.getPracticeSets
);
router.get('/:id', validatePracticeSetIdParam, validateRequest, practiceSetController.getPracticeSet);
router.put('/:id', protect, isAdmin, validatePracticeSetIdParam, validateRequest, practiceSetController.updatePracticeSet);
router.delete('/:id', protect, isAdmin, validatePracticeSetIdParam, validateRequest, practiceSetController.deletePracticeSet);
router.post('/:id/submit', protect, validatePracticeSetIdParam, validateSubmitAnswer, validateRequest, practiceSetController.submitPracticeSet);

module.exports = router; 