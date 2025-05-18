const { validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lesson = new Lesson({
      ...req.body,
      author: req.user._id
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all lessons with filtering and pagination
exports.getLessons = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'published' };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const lessons = await Lesson.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('prerequisites', 'title');

    // Get total count for pagination
    const total = await Lesson.countDocuments(query);

    res.json({
      lessons,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLessons: total
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single lesson by ID
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('prerequisites', 'title')
      .populate('practiceSets', 'title description');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the author or an admin
    if (lesson.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      lesson[key] = req.body[key];
    });

    await lesson.save();
    res.json(lesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the author or an admin
    if (lesson.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    // Instead of deleting, mark as archived
    lesson.status = 'archived';
    await lesson.save();

    res.json({ message: 'Lesson archived successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get lessons by category
exports.getLessonsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const lessons = await Lesson.find({
      category,
      status: 'published'
    })
    .populate('author', 'username profile.firstName profile.lastName')
    .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (error) {
    console.error('Get lessons by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search lessons
exports.searchLessons = async (req, res) => {
  try {
    const { query } = req.query;
    const lessons = await Lesson.find(
      { $text: { $search: query }, status: 'published' },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'username profile.firstName profile.lastName');

    res.json(lessons);
  } catch (error) {
    console.error('Search lessons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 