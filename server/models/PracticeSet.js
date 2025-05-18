const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'short-answer', 'essay_mathjax'],
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  }
});

const SubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    points: Number,
    feedback: String
  }],
  score: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'reviewed'],
    default: 'submitted'
  }
});

const PracticeSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  topic: {
    type: String,
    required: true
  },
  questions: [QuestionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number, // in minutes
    default: null
  },
  attemptsAllowed: {
    type: Number,
    default: 1
  },
  submissions: [SubmissionSchema],
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
PracticeSetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total points
  this.totalPoints = this.questions.reduce((sum, question) => sum + question.points, 0);
  
  next();
});

// Add text index for search functionality
PracticeSetSchema.index({
  title: 'text',
  description: 'text',
  topic: 'text'
});

module.exports = mongoose.model('PracticeSet', PracticeSetSchema); 