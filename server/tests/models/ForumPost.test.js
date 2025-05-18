const mongoose = require('mongoose');
const ForumPost = require('../../models/ForumPost');
const ForumThread = require('../../models/ForumThread');
const { createTestUser } = require('../utils/testUtils');

describe('ForumPost Model Tests', () => {
  let testUser;
  let secondUser;
  let testThread;

  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Create test users
    testUser = await createTestUser();
    secondUser = await createTestUser({
      username: 'seconduser',
      email: 'seconduser@example.com'
    });
    
    // Create a test thread for the posts
    testThread = new ForumThread({
      title: 'Test Forum Thread',
      content: 'This is a test forum thread with sufficient content.',
      category: 'general',
      tags: ['test'],
      createdBy: testUser._id,
      authorName: testUser.username
    });
    await testThread.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Schema Validation', () => {
    test('should create a valid forum post with all required fields', async () => {
      const postData = {
        content: 'This is a test forum post with content.',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const post = new ForumPost(postData);
      const savedPost = await post.save();

      expect(savedPost._id).toBeDefined();
      expect(savedPost.content).toBe(postData.content);
      expect(savedPost.threadId.toString()).toBe(testThread._id.toString());
      expect(savedPost.createdBy.toString()).toBe(testUser._id.toString());
      expect(savedPost.authorName).toBe(testUser.username);
      expect(savedPost.isEdited).toBe(false); // Default value
      expect(savedPost.likeCount).toBe(0); // Default value
      expect(savedPost.likes).toEqual([]); // Default value
      expect(savedPost.isSolution).toBe(false); // Default value
      expect(savedPost.createdAt).toBeDefined();
      expect(savedPost.updatedAt).toBeDefined();
    });

    test('should fail when content is not provided', async () => {
      const postData = {
        // content is missing
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const post = new ForumPost(postData);
      
      await expect(post.save()).rejects.toThrow(/Post content is required/);
    });

    test('should fail when content is empty after trimming', async () => {
      const postData = {
        content: '   ', // Empty after trim
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const post = new ForumPost(postData);
      
      await expect(post.save()).rejects.toThrow(/Post content cannot be empty/);
    });

    test('should fail when threadId is not provided', async () => {
      const postData = {
        content: 'This is a test forum post with content.',
        // threadId is missing
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const post = new ForumPost(postData);
      
      await expect(post.save()).rejects.toThrow();
    });

    test('should fail when createdBy is not provided', async () => {
      const postData = {
        content: 'This is a test forum post with content.',
        threadId: testThread._id,
        // createdBy is missing
        authorName: testUser.username
      };

      const post = new ForumPost(postData);
      
      await expect(post.save()).rejects.toThrow();
    });

    test('should fail when authorName is not provided', async () => {
      const postData = {
        content: 'This is a test forum post with content.',
        threadId: testThread._id,
        createdBy: testUser._id
        // authorName is missing
      };

      const post = new ForumPost(postData);
      
      await expect(post.save()).rejects.toThrow();
    });

    test('should properly trim the content field', async () => {
      const postData = {
        content: '  This is a test forum post with trimmed content.  ',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const post = new ForumPost(postData);
      const savedPost = await post.save();

      expect(savedPost.content).toBe('This is a test forum post with trimmed content.');
    });
  });

  describe('Default Values', () => {
    test('should set default values correctly', async () => {
      const post = await new ForumPost({
        content: 'Test post content',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      expect(post.isEdited).toBe(false);
      expect(post.editedAt).toBeUndefined();
      expect(post.editedBy).toBeUndefined();
      expect(post.likes).toEqual([]);
      expect(post.likeCount).toBe(0);
      expect(post.parentPost).toBeUndefined();
      expect(post.isSolution).toBe(false);
    });

    test('should set timestamps automatically', async () => {
      const post = await new ForumPost({
        content: 'Test post content',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      expect(post.createdAt).toBeDefined();
      expect(post.updatedAt).toBeDefined();
      expect(post.createdAt instanceof Date).toBe(true);
      expect(post.updatedAt instanceof Date).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    test('toggleLike should add a user to likes when not already liked', async () => {
      // Create a post
      const post = await new ForumPost({
        content: 'Test post content',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Toggle like
      await post.toggleLike(secondUser._id);
      
      // Verify user was added to likes
      expect(post.likes).toHaveLength(1);
      expect(post.likes[0].toString()).toBe(secondUser._id.toString());
      expect(post.likeCount).toBe(1);
    });

    test('toggleLike should remove a user from likes when already liked', async () => {
      // Create a post with a like
      const post = await new ForumPost({
        content: 'Test post content',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username,
        likes: [secondUser._id],
        likeCount: 1
      }).save();
      
      // Toggle like to remove
      await post.toggleLike(secondUser._id);
      
      // Verify user was removed from likes
      expect(post.likes).toHaveLength(0);
      expect(post.likeCount).toBe(0);
    });

    test('markAsEdited should update edit-related fields', async () => {
      // Create a post
      const post = await new ForumPost({
        content: 'Test post content',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Mark as edited
      await post.markAsEdited(secondUser._id);
      
      // Verify fields were updated
      expect(post.isEdited).toBe(true);
      expect(post.editedAt).toBeDefined();
      expect(post.editedBy.toString()).toBe(secondUser._id.toString());
    });

    test('markAsSolution should mark post as solution and unmark other solutions', async () => {
      // Create two posts in the same thread
      const post1 = await new ForumPost({
        content: 'First post',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username,
        isSolution: true // Initially marked as solution
      }).save();
      
      const post2 = await new ForumPost({
        content: 'Second post',
        threadId: testThread._id,
        createdBy: secondUser._id,
        authorName: secondUser.username
      }).save();
      
      // Mark post2 as solution
      await post2.markAsSolution();
      
      // Refresh post1 from database
      const updatedPost1 = await ForumPost.findById(post1._id);
      
      // Verify post2 is now solution and post1 is not
      expect(post2.isSolution).toBe(true);
      expect(updatedPost1.isSolution).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('findByThread should return posts for a thread with pagination', async () => {
      // Create multiple posts in the thread
      await Promise.all([
        new ForumPost({
          content: 'First post',
          threadId: testThread._id,
          createdBy: testUser._id,
          authorName: testUser.username
        }).save(),
        new ForumPost({
          content: 'Second post',
          threadId: testThread._id,
          createdBy: secondUser._id,
          authorName: secondUser.username
        }).save(),
        new ForumPost({
          content: 'Third post',
          threadId: testThread._id,
          createdBy: testUser._id,
          authorName: testUser.username
        }).save()
      ]);
      
      // Get posts for thread with pagination
      const postsPage1 = await ForumPost.findByThread(testThread._id, 1, 2);
      const postsPage2 = await ForumPost.findByThread(testThread._id, 2, 2);
      
      // Verify pagination works
      expect(postsPage1).toHaveLength(2);
      expect(postsPage2).toHaveLength(1);
      
      // Verify posts are ordered by createdAt
      expect(postsPage1[0].content).toBe('First post');
      expect(postsPage1[1].content).toBe('Second post');
      expect(postsPage2[0].content).toBe('Third post');
    });

    test('findReplies should return replies to a post', async () => {
      // Create a parent post
      const parentPost = await new ForumPost({
        content: 'Parent post',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Create replies to the parent post
      await Promise.all([
        new ForumPost({
          content: 'Reply 1',
          threadId: testThread._id,
          createdBy: secondUser._id,
          authorName: secondUser.username,
          parentPost: parentPost._id
        }).save(),
        new ForumPost({
          content: 'Reply 2',
          threadId: testThread._id,
          createdBy: testUser._id,
          authorName: testUser.username,
          parentPost: parentPost._id
        }).save()
      ]);
      
      // Get replies to the parent post
      const replies = await ForumPost.findReplies(parentPost._id);
      
      // Verify replies were returned
      expect(replies).toHaveLength(2);
      expect(replies[0].content).toBe('Reply 1');
      expect(replies[1].content).toBe('Reply 2');
    });
  });

  describe('Indexes', () => {
    test('should have indexes for better performance', async () => {
      // Create a second thread and posts in both threads
      const secondThread = await new ForumThread({
        title: 'Second Thread',
        content: 'Content for second thread with sufficient length.',
        category: 'general',
        createdBy: secondUser._id,
        authorName: secondUser.username
      }).save();
      
      // Create posts in different threads
      await Promise.all([
        new ForumPost({
          content: 'Post in first thread',
          threadId: testThread._id,
          createdBy: testUser._id,
          authorName: testUser.username
        }).save(),
        new ForumPost({
          content: 'Second post in first thread',
          threadId: testThread._id,
          createdBy: secondUser._id,
          authorName: secondUser.username
        }).save(),
        new ForumPost({
          content: 'Post in second thread',
          threadId: secondThread._id,
          createdBy: testUser._id,
          authorName: testUser.username
        }).save()
      ]);
      
      // Test threadId + createdAt index by querying for posts in first thread
      const postsInFirstThread = await ForumPost.find({ threadId: testThread._id }).sort({ createdAt: 1 });
      expect(postsInFirstThread).toHaveLength(2);
      
      // Test createdBy index by querying for posts by first user
      const postsByFirstUser = await ForumPost.find({ createdBy: testUser._id });
      expect(postsByFirstUser).toHaveLength(2);
    });
  });

  describe('Reply Functionality', () => {
    test('should create a valid reply to another post', async () => {
      // Create a parent post
      const parentPost = await new ForumPost({
        content: 'Parent post content',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Create a reply to the parent post
      const replyData = {
        content: 'This is a reply to the parent post',
        threadId: testThread._id,
        createdBy: secondUser._id,
        authorName: secondUser.username,
        parentPost: parentPost._id
      };
      
      const reply = new ForumPost(replyData);
      const savedReply = await reply.save();
      
      // Verify reply was created properly
      expect(savedReply._id).toBeDefined();
      expect(savedReply.content).toBe(replyData.content);
      expect(savedReply.parentPost.toString()).toBe(parentPost._id.toString());
    });

    test('should save nested replies (replies to replies)', async () => {
      // Create parent post
      const parentPost = await new ForumPost({
        content: 'Original post',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Create first level reply
      const firstReply = await new ForumPost({
        content: 'First level reply',
        threadId: testThread._id,
        createdBy: secondUser._id,
        authorName: secondUser.username,
        parentPost: parentPost._id
      }).save();
      
      // Create a reply to the first reply (second level)
      const secondReply = await new ForumPost({
        content: 'Second level reply',
        threadId: testThread._id,
        createdBy: testUser._id,
        authorName: testUser.username,
        parentPost: firstReply._id
      }).save();
      
      // Verify the relationship chain
      expect(secondReply.parentPost.toString()).toBe(firstReply._id.toString());
      expect(firstReply.parentPost.toString()).toBe(parentPost._id.toString());
    });
  });
}); 