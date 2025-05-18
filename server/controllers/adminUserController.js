const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get a paginated, filtered, and sorted list of users
 * @route GET /api/v1/admin/users
 * @access Private (Admin only)
 */
exports.listUsers = async (req, res, next) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword;
    const role = req.query.role;
    const isBanned = req.query.isBanned !== undefined ? req.query.isBanned : undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive : undefined;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query object
    const queryObject = {};

    // Search by keyword if provided
    if (keyword) {
      queryObject.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { 'profile.firstName': { $regex: keyword, $options: 'i' } },
        { 'profile.lastName': { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by role if provided
    if (role) {
      queryObject.role = role;
    }

    // Filter by banned status if provided
    if (isBanned !== undefined) {
      queryObject.isBanned = isBanned;
    }

    // Filter by active status if provided
    if (isActive !== undefined) {
      queryObject.isActive = isActive;
    }

    // Create sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder;

    // Execute query with pagination
    const users = await User.find(queryObject)
      .select('-password -passwordChangedAt -passwordResetToken -passwordResetExpires')
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    // Count total matching documents
    const totalUsers = await User.countDocuments(queryObject);
    const totalPages = Math.ceil(totalUsers / limit);

    // Return paginated results
    res.status(200).json({
      status: 'success',
      results: users.length,
      totalUsers,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single user by ID
 * @route GET /api/v1/admin/users/:userId
 * @access Private (Admin only)
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -passwordChangedAt -passwordResetToken -passwordResetExpires');

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user's role or status
 * @route PUT /api/v1/admin/users/:userId
 * @access Private (Admin only)
 */
exports.updateUserByAdmin = async (req, res, next) => {
  try {
    // Extract allowed fields from request body
    const { role, isBanned, isActive } = req.body;
    const updateFields = {};

    // Only add fields that are provided
    if (role !== undefined) updateFields.role = role;
    if (isBanned !== undefined) updateFields.isBanned = isBanned;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Prevent changing your own admin status
    if (req.user._id.toString() === req.params.userId && 
        (role && role !== 'admin' || isActive === false)) {
      return next(new ApiError(403, 'Admin cannot change their own admin status or deactivate themselves'));
    }

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateFields,
      {
        new: true, // Return updated document
        runValidators: true, // Run Mongoose validations
        select: '-password -passwordChangedAt -passwordResetToken -passwordResetExpires'
      }
    );

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user (soft delete by setting isActive to false)
 * @route DELETE /api/v1/admin/users/:userId
 * @access Private (Admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent deleting yourself
    if (req.user._id.toString() === req.params.userId) {
      return next(new ApiError(403, 'Admin cannot delete their own account'));
    }

    // Soft delete by setting isActive to false
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: false },
      { 
        new: true,
        select: '-password -passwordChangedAt -passwordResetToken -passwordResetExpires'
      }
    );

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      status: 'success',
      message: 'User has been deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
}; 