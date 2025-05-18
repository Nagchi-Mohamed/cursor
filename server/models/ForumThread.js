const mongoose = require('mongoose');

const forumThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Thread title is required'],
    trim: true,
    minlength: [3, 'Thread title must be at least 3 characters long'],
    maxlength: [200, 'Thread title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Thread content is required'],
    trim: true,
    minlength: [10, 'Thread content must be at least 10 characters long']
  },
  category: {
    type: String,
    required: [true, 'Thread category is required'],
    enum: ['general', 'help', 'discussion', 'announcement']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  postCount: {
    type: Number,
    default: 1 // Starts at 1 because the initial post counts
  },
  lastReplyAt: {
    type: Date,
    default: Date.now
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
forumThreadSchema.index({ category: 1, lastReplyAt: -1 });
forumThreadSchema.index({ createdBy: 1 });
forumThreadSchema.index({ tags: 1 });

// Virtual for URL
forumThreadSchema.virtual('url').get(function() {
  return `/forum/threads/${this._id}`;
});

// Method to increment post count and update last reply
forumThreadSchema.methods.incrementPostCount = function() {
  this.postCount += 1;
  this.lastReplyAt = new Date();
  return this.save();
};

// Method to increment view count
forumThreadSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to find threads by category with pagination
forumThreadSchema.statics.findByCategory = function(category, page = 1, limit = 20) {
  return this.find({ category })
    .sort({ lastReplyAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('createdBy', 'username avatar');
};

// Static method to search threads
forumThreadSchema.statics.search = function(query, page = 1, limit = 20) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  })
    .sort({ lastReplyAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('createdBy', 'username avatar');
};

const ForumThread = mongoose.model('ForumThread', forumThreadSchema);

module.exports = ForumThread; 