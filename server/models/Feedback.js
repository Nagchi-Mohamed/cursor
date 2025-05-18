const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required because anonymous feedback is allowed
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    minlength: [3, 'Feedback message must be at least 3 characters'],
    maxlength: [5000, 'Feedback message cannot exceed 5000 characters']
  },
  context: {
    page: {
      type: String,
      trim: true,
      maxlength: [100, 'Page context cannot exceed 100 characters']
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      validate: {
        validator: function(v) {
          return !v || mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid lesson ID format'
      }
    },
    practiceSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeSet',
      validate: {
        validator: function(v) {
          return !v || mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid practice set ID format'
      }
    }
  },
  status: {
    type: String,
    enum: {
      values: ['New', 'Read', 'In Progress', 'Resolved', 'Archived'],
      message: '{VALUE} is not a valid status'
    },
    default: 'New',
    required: true
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Ensure either userId or email is provided
feedbackSchema.pre('validate', function(next) {
  if (!this.userId && !this.email) {
    this.invalidate('email', 'Either user ID or email must be provided');
  }
  next();
});

// Indexes for efficient queries
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ 'context.lessonId': 1 });
feedbackSchema.index({ 'context.practiceSetId': 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback; 