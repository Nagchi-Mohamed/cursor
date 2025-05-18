const express = require('express');
const { body, check } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/rateLimiter');

// Validation middleware
const registerValidation = [
  check('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  // Check for allowed fields only to prevent injections
  body()
    .custom(body => {
      const allowedFields = ['username', 'email', 'password', 'confirmPassword'];
      const receivedFields = Object.keys(body);
      
      for (const field of receivedFields) {
        if (!allowedFields.includes(field)) {
          throw new Error(`Field '${field}' is not allowed during registration`);
        }
      }
      
      return true;
    })
];

const loginValidation = [
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  check('password')
    .exists()
    .withMessage('Password is required'),
    
  // Check for allowed fields only to prevent injections
  body()
    .custom(body => {
      const allowedFields = ['email', 'password', 'rememberMe'];
      const receivedFields = Object.keys(body);
      
      for (const field of receivedFields) {
        if (!allowedFields.includes(field)) {
          throw new Error(`Field '${field}' is not allowed during login`);
        }
      }
      
      return true;
    })
];

const updatePreferencesValidation = [
  check('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Invalid theme preference'),
  check('language')
    .optional()
    .isIn(['en', 'es', 'fr'])
    .withMessage('Invalid language preference'),
  check('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be a boolean value'),
  check('notifications.inApp')
    .optional()
    .isBoolean()
    .withMessage('In-app notifications preference must be a boolean value'),
    
  // Check for allowed fields only to prevent injections
  body()
    .custom(body => {
      const allowedFields = ['theme', 'language', 'notifications'];
      const receivedFields = Object.keys(body);
      
      for (const field of receivedFields) {
        if (!allowedFields.includes(field)) {
          throw new Error(`Field '${field}' is not allowed when updating preferences`);
        }
      }
      
      if (body.notifications) {
        const allowedNotificationFields = ['email', 'inApp'];
        const receivedNotificationFields = Object.keys(body.notifications);
        
        for (const field of receivedNotificationFields) {
          if (!allowedNotificationFields.includes(field)) {
            throw new Error(`Notification field '${field}' is not allowed`);
          }
        }
      }
      
      return true;
    })
];

// Public routes
router.post('/register', authLimiter, registerValidation, validateRequest, authController.register);
router.post('/login', authLimiter, loginValidation, validateRequest, authController.login);
router.post('/logout', authController.logout);

// Protected routes (require authentication)
router.get('/me', protect, authController.getCurrentUser);
router.patch('/preferences', protect, updatePreferencesValidation, validateRequest, authController.updatePreferences);

module.exports = router; 