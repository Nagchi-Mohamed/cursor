const { ApiError } = require('../middleware/errorHandler');
const Lesson = require('../models/Lesson');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/lessons';
    // Create directory if it doesn't exist
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
}).single('media');

// Create a new lesson
exports.createLesson = async (req, res, next) => {
  try {
    const lessonData = {
      ...req.body,
      author: req.user._id
    };

    const lesson = await Lesson.create(lessonData);
    res.status(201).json({
      status: 'success',
      data: {
        lesson
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all lessons (with filtering, sorting, and pagination)
exports.getLessons = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Handle search
    if (req.query.search) {
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { summary: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build query string
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    // Execute query
    let query = Lesson.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const lessons = await query;
    const total = await Lesson.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        lessons
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single lesson
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('author', 'username email')
      .populate('prerequisites', 'title slug')
      .populate('relatedLessons', 'title slug');

    if (!lesson) {
      return next(new ApiError(404, 'Lesson not found'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a lesson
exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(new ApiError(404, 'Lesson not found'));
    }

    // Check if user is the author or an admin
    if (lesson.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, 'You do not have permission to update this lesson'));
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        lesson: updatedLesson
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a lesson (soft delete by setting status to 'archived')
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(new ApiError(404, 'Lesson not found'));
    }

    // Check if user is the author or an admin
    if (lesson.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, 'You do not have permission to delete this lesson'));
    }

    lesson.status = 'archived';
    await lesson.save();

    res.status(200).json({
      status: 'success',
      message: 'Lesson archived successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload media for lessons
exports.uploadMedia = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }

    if (!req.file) {
      return next(new ApiError(400, 'Please upload a file'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        url: `/uploads/lessons/${req.file.filename}`,
        filename: req.file.filename
      }
    });
  });
}; 