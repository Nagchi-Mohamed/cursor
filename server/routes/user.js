const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { validateRequest } = require('../middleware/errorHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
});

// Validation middleware
const profileValidation = [
  check('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  check('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  check('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  check('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
  check('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL'),
  check('socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  check('socialLinks.*')
    .optional()
    .isURL()
    .withMessage('Please enter a valid URL for social link')
];

const passwordChangeValidation = [
  check('currentPassword')
    .exists()
    .withMessage('Current password is required'),
  check('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// User management validation middleware
const updateUserRoleStatusValidation = [
  check('role')
    .optional()
    .isIn(['user', 'editor', 'admin'])
    .withMessage('Role must be one of: user, editor, admin'),
  check('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  check('isBanned')
    .optional()
    .isBoolean()
    .withMessage('isBanned must be a boolean value')
];

// Routes
router.get('/profile/:id', protect, userController.getProfile);
router.patch('/profile', protect, profileValidation, validateRequest, userController.updateProfile);
router.patch('/avatar', protect, upload.single('avatar'), userController.updateAvatar);
router.patch('/password', protect, passwordChangeValidation, validateRequest, userController.changePassword);
router.get('/progress', protect, userController.getProgress);
router.post('/progress/lessons', protect, userController.addCompletedLesson);
router.post('/progress/practice-sets', protect, userController.addCompletedPracticeSet);

// Admin routes for user management
router.get('/', protect, isAdmin, userController.listUsers);
router.get('/:id', protect, isAdmin, userController.getUserById);
router.put('/:id', protect, isAdmin, updateUserRoleStatusValidation, validateRequest, userController.updateUserRoleStatus);

module.exports = router;
