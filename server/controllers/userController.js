const { validationResult } = require('express-validator');
const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    user.profile = {
      ...user.profile,
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      bio: bio || user.profile.bio
    };

    await user.save();
    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user avatar
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile.avatar = req.file.path;
    await user.save();

    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user progress
exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('progress.completedLessons.lesson')
      .populate('progress.completedPracticeSets.practiceSet');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add completed lesson
exports.addCompletedLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if lesson already completed
    const alreadyCompleted = user.progress.completedLessons.some(
      lesson => lesson.lesson.toString() === lessonId
    );

    if (!alreadyCompleted) {
      user.progress.completedLessons.push({
        lesson: lessonId,
        completedAt: new Date()
      });

      await user.save();
    }

    res.json(user.progress);
  } catch (error) {
    console.error('Add completed lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add completed practice set
exports.addCompletedPracticeSet = async (req, res) => {
  try {
    const { practiceSetId, score } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if practice set already completed
    const alreadyCompleted = user.progress.completedPracticeSets.some(
      ps => ps.practiceSet.toString() === practiceSetId
    );

    if (!alreadyCompleted) {
      user.progress.completedPracticeSets.push({
        practiceSet: practiceSetId,
        score,
        completedAt: new Date()
      });

      await user.save();
    }

    res.json(user.progress);
  } catch (error) {
    console.error('Add completed practice set error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: List all users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get user details by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update user role and status
exports.updateUserRoleStatus = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update user role/status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
