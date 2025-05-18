const Feedback = require('../models/Feedback');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get a paginated, filtered, and sorted list of feedback
 * @route GET /api/v1/admin/feedback
 * @access Private (Admin only)
 */
exports.listFeedback = async (req, res, next) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query object
    const queryObject = {};

    // Filter by status if provided
    if (status) {
      queryObject.status = status;
    }

    // Search by message or email if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      queryObject.$or = [
        { message: searchRegex },
        { email: searchRegex }
      ];
    }

    // Create sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder;

    // Execute query with pagination
    const feedback = await Feedback.find(queryObject)
      .populate('userId', 'username email profile.firstName profile.lastName')
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    // Count total matching documents
    const totalFeedback = await Feedback.countDocuments(queryObject);
    const totalPages = Math.ceil(totalFeedback / limit);

    // Return paginated results
    res.status(200).json({
      status: 'success',
      results: feedback.length,
      totalFeedback,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: {
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single feedback item by ID
 * @route GET /api/v1/admin/feedback/:feedbackId
 * @access Private (Admin only)
 */
exports.getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId)
      .populate('userId', 'username email profile.firstName profile.lastName');

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a feedback item's status
 * @route PUT /api/v1/admin/feedback/:feedbackId
 * @access Private (Admin only)
 */
exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Find and update the feedback
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.feedbackId,
      { status },
      {
        new: true, // Return updated document
        runValidators: true // Run Mongoose validations
      }
    ).populate('userId', 'username email profile.firstName profile.lastName');

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive/delete a feedback item
 * @route DELETE /api/v1/admin/feedback/:feedbackId
 * @access Private (Admin only)
 */
exports.archiveFeedback = async (req, res, next) => {
  try {
    // This is a soft delete that sets the status to 'Archived'
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.feedbackId,
      { status: 'Archived' },
      { new: true }
    );

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    res.status(200).json({
      status: 'success',
      message: 'Feedback has been archived successfully'
    });
  } catch (error) {
    next(error);
  }
}; 