const PracticeSet = require('../models/PracticeSet');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Get all practice sets with filtering, sorting, and pagination
exports.getPracticeSets = catchAsync(async (req, res) => {
  const query = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(field => delete query[field]);

  // Advanced filtering
  let queryStr = JSON.stringify(query);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
  
  let practiceSetsQuery = PracticeSet.find(JSON.parse(queryStr));

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    practiceSetsQuery = practiceSetsQuery.sort(sortBy);
  } else {
    practiceSetsQuery = practiceSetsQuery.sort('-createdAt');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    practiceSetsQuery = practiceSetsQuery.select(fields);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  practiceSetsQuery = practiceSetsQuery.skip(skip).limit(limit);

  const practiceSets = await practiceSetsQuery;
  const total = await PracticeSet.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: {
      practiceSets
    }
  });
});

// Get a single practice set
exports.getPracticeSet = catchAsync(async (req, res) => {
  const practiceSet = await PracticeSet.findById(req.params.id);

  if (!practiceSet) {
    throw new ApiError('Practice set not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      practiceSet
    }
  });
});

// Create a new practice set
exports.createPracticeSet = catchAsync(async (req, res) => {
  const practiceSet = await PracticeSet.create({
    ...req.body,
    author: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: {
      practiceSet
    }
  });
});

// Update a practice set
exports.updatePracticeSet = catchAsync(async (req, res) => {
  const practiceSet = await PracticeSet.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!practiceSet) {
    throw new ApiError('Practice set not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      practiceSet
    }
  });
});

// Delete a practice set (soft delete by setting status to 'archived')
exports.deletePracticeSet = catchAsync(async (req, res) => {
  const practiceSet = await PracticeSet.findById(req.params.id);

  if (!practiceSet) {
    throw new ApiError('Practice set not found', 404);
  }

  practiceSet.status = 'archived';
  await practiceSet.save();

  res.status(200).json({
    status: 'success',
    message: 'Practice set archived successfully'
  });
});
