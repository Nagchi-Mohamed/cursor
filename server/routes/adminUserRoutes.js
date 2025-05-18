const express = require('express');
const router = express.Router();

// Import controller
const adminUserController = require('../controllers/adminUserController');

// Import middleware
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
  validateListUsersQuery,
  validateUserIdParam,
  validateUpdateUserByAdmin
} = require('../middleware/validators/adminUserValidators');

// Apply protection middlewares to all routes
router.use(protect);
router.use(isAdmin);

// Route: /api/v1/admin/users
router.route('/')
  .get(validateListUsersQuery, adminUserController.listUsers);

// Route: /api/v1/admin/users/:userId
router.route('/:userId')
  .get(validateUserIdParam, adminUserController.getUserById)
  .put(validateUserIdParam, validateUpdateUserByAdmin, adminUserController.updateUserByAdmin)
  .delete(validateUserIdParam, adminUserController.deleteUser);

module.exports = router; 