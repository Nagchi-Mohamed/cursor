const { validationResult } = require('express-validator');
const ForumThread = require('../models/ForumThread');
const ForumPost = require('../models/ForumPost');
const ApiError = require('../utils/ApiError');

/**
 * Create a new forum thread
 * @route POST /api/forum/threads
 * @access Private
 */
exports.createThread = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation Error', errors.array());
    }

    const { title, content, category, tags } = req.body;
    const thread = new ForumThread({
      title,
      content,
      category,
      tags,
      createdBy: req.user._id,
      authorName: req.user.username
    });

    await thread.save();

    // Create the initial post
    const post = new ForumPost({
      content,
      threadId: thread._id,
      createdBy: req.user._id,
      authorName: req.user.username
    });

    await post.save();

    res.status(201).json({
      success: true,
      data: {
        thread,
        post
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all forum threads with pagination
 * @route GET /api/forum/threads
 * @access Public
 */
exports.getThreads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const category = req.query.category;
    const search = req.query.search;

    let threads;
    let total;

    if (search) {
      threads = await ForumThread.search(search, page, limit);
      total = await ForumThread.countDocuments({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    } else if (category) {
      threads = await ForumThread.findByCategory(category, page, limit);
      total = await ForumThread.countDocuments({ category });
    } else {
      threads = await ForumThread.find()
        .sort({ lastReplyAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'username avatar');
      total = await ForumThread.countDocuments();
    }

    res.json({
      success: true,
      data: {
        threads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single forum thread by ID
 * @route GET /api/forum/threads/:threadId
 * @access Public
 */
exports.getThread = async (req, res, next) => {
  try {
    const thread = await ForumThread.findById(req.params.threadId)
      .populate('createdBy', 'username avatar');

    if (!thread) {
      throw new ApiError(404, 'Thread not found');
    }

    // Increment view count
    await thread.incrementViewCount();

    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new post in a thread
 * @route POST /api/forum/threads/:threadId/posts
 * @access Private
 */
exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation Error', errors.array());
    }

    const thread = await ForumThread.findById(req.params.threadId);
    if (!thread) {
      throw new ApiError(404, 'Thread not found');
    }

    if (thread.isLocked) {
      throw new ApiError(403, 'This thread is locked');
    }

    const { content, parentPost } = req.body;
    const post = new ForumPost({
      content,
      threadId: thread._id,
      createdBy: req.user._id,
      authorName: req.user.username,
      parentPost
    });

    await post.save();
    await thread.incrementPostCount();

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get posts for a thread with pagination
 * @route GET /api/forum/threads/:threadId/posts
 * @access Public
 */
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const posts = await ForumPost.findByThread(req.params.threadId, page, limit);
    const total = await ForumPost.countDocuments({ threadId: req.params.threadId });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a post
 * @route PUT /api/forum/posts/:postId
 * @access Private
 */
exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation Error', errors.array());
    }

    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Check if user is the author or an admin
    if (post.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError(403, 'Not authorized to update this post');
    }

    const { content } = req.body;
    post.content = content;
    await post.markAsEdited(req.user._id);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a post
 * @route DELETE /api/forum/posts/:postId
 * @access Private
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Check if user is the author or an admin
    if (post.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError(403, 'Not authorized to delete this post');
    }

    await post.remove();

    // If this was the first post in the thread, delete the thread too
    if (post.parentPost === null) {
      await ForumThread.findByIdAndDelete(post.threadId);
    } else {
      // Update thread post count
      const thread = await ForumThread.findById(post.threadId);
      if (thread) {
        thread.postCount = Math.max(0, thread.postCount - 1);
        await thread.save();
      }
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle like on a post
 * @route POST /api/forum/posts/:postId/like
 * @access Private
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    await post.toggleLike(req.user._id);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a post as solution
 * @route POST /api/forum/posts/:postId/solution
 * @access Private
 */
exports.markAsSolution = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Check if user is the thread author or an admin
    const thread = await ForumThread.findById(post.threadId);
    if (thread.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError(403, 'Not authorized to mark solution');
    }

    await post.markAsSolution();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
}; 