const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const feedback = new Feedback({
      message: req.body.message,
      context: req.body.context || {},
      userId: req.user ? req.user._id : null,
      email: req.body.email
    });

    await feedback.save();

    res.status(201).json({
      status: 'success',
      data: { feedback }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating feedback'
    });
  }
};

// Get all feedback (admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = status ? { status } : {};
    
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Feedback.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        feedback,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching feedback'
    });
  }
};

// Update feedback status (admin only)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }

    res.json({
      status: 'success',
      data: { feedback }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating feedback'
    });
  }
}; 