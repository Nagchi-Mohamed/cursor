const express = require('express');
const router = express.Router();

// Import controller
const adminFeedbackController = require('../controllers/adminFeedbackController');

// Import middleware
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
  validateListFeedbackQuery,
  validateFeedbackIdParam,
  validateFeedbackStatusUpdate
} = require('../middleware/validators/adminFeedbackValidators');

// Apply protection middlewares to all routes
router.use(protect);
router.use(isAdmin);

// Route: /api/v1/admin/feedback
router.route('/')
  .get(validateListFeedbackQuery, adminFeedbackController.listFeedback);

// Route: /api/v1/admin/feedback/:feedbackId
router.route('/:feedbackId')
  .get(validateFeedbackIdParam, adminFeedbackController.getFeedbackById)
  .put(
    validateFeedbackIdParam, 
    validateFeedbackStatusUpdate, 
    adminFeedbackController.updateFeedbackStatus
  )
  .delete(validateFeedbackIdParam, adminFeedbackController.archiveFeedback);

module.exports = router; 