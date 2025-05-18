const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { protect, authorize } = require('../middleware/auth');
const {
  createThreadRules,
  createPostRules,
  updatePostRules,
  getThreadsRules,
  getPostsRules,
  postActionRules
} = require('../middleware/validators/forumValidators');

// Thread routes
router
  .route('/threads')
  .get(getThreadsRules, forumController.getThreads)
  .post(protect, createThreadRules, forumController.createThread);

router
  .route('/threads/:threadId')
  .get(forumController.getThread);

// Post routes
router
  .route('/threads/:threadId/posts')
  .get(getPostsRules, forumController.getPosts)
  .post(protect, createPostRules, forumController.createPost);

router
  .route('/posts/:postId')
  .put(protect, updatePostRules, forumController.updatePost)
  .delete(protect, forumController.deletePost);

// Post actions
router
  .route('/posts/:postId/like')
  .post(protect, postActionRules, forumController.toggleLike);

router
  .route('/posts/:postId/solution')
  .post(protect, postActionRules, forumController.markAsSolution);

module.exports = router; 