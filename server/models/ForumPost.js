const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    minlength: [1, 'Post content cannot be empty']
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumThread',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  isSolution: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
forumPostSchema.index({ threadId: 1, createdAt: 1 });
forumPostSchema.index({ createdBy: 1 });
forumPostSchema.index({ parentPost: 1 });

// Method to toggle like
forumPostSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
    this.likeCount += 1;
  } else {
    this.likes.splice(index, 1);
    this.likeCount -= 1;
  }
  return this.save();
};

// Method to mark as edited
forumPostSchema.methods.markAsEdited = function(editorId) {
  this.isEdited = true;
  this.editedAt = new Date();
  this.editedBy = editorId;
  return this.save();
};

// Method to mark as solution
forumPostSchema.methods.markAsSolution = async function() {
  // First, unmark any existing solution in the thread
  await this.constructor.updateMany(
    { threadId: this.threadId, isSolution: true },
    { isSolution: false }
  );
  
  // Then mark this post as the solution
  this.isSolution = true;
  return this.save();
};

// Static method to get posts for a thread with pagination
forumPostSchema.statics.findByThread = function(threadId, page = 1, limit = 20) {
  return this.find({ threadId })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('createdBy', 'username avatar')
    .populate('editedBy', 'username')
    .populate('parentPost');
};

// Static method to get replies to a post
forumPostSchema.statics.findReplies = function(postId) {
  return this.find({ parentPost: postId })
    .sort({ createdAt: 1 })
    .populate('createdBy', 'username avatar');
};

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost; 