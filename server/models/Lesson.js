const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Number Theory', 'Applied Mathematics']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  practiceSets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeSet'
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['video', 'document', 'link', 'interactive']
    },
    url: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
LessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add text index for search functionality
LessonSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Lesson', LessonSchema); 