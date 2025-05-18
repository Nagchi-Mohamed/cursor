const mongoose = require('mongoose');
const ForumThread = require('../../models/ForumThread');
const { createTestUser } = require('../utils/testUtils');

describe('ForumThread Model Tests', () => {
  let testUser;

  beforeAll(async () => {
    await global.connectToDatabase();
    // Create a test user to be used as thread author
    testUser = await createTestUser();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Recreate the test user for each test
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Schema Validation', () => {
    test('should create a valid forum thread with all required fields', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        tags: ['test', 'forum', 'thread'],
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      const savedThread = await thread.save();

      expect(savedThread._id).toBeDefined();
      expect(savedThread.title).toBe(threadData.title);
      expect(savedThread.content).toBe(threadData.content);
      expect(savedThread.category).toBe(threadData.category);
      expect(savedThread.tags).toEqual(expect.arrayContaining(threadData.tags));
      expect(savedThread.createdBy.toString()).toBe(testUser._id.toString());
      expect(savedThread.authorName).toBe(testUser.username);
      expect(savedThread.postCount).toBe(1); // Default value
      expect(savedThread.isLocked).toBe(false); // Default value
      expect(savedThread.isPinned).toBe(false); // Default value
      expect(savedThread.viewCount).toBe(0); // Default value
      expect(savedThread.createdAt).toBeDefined();
      expect(savedThread.updatedAt).toBeDefined();
      expect(savedThread.lastReplyAt).toBeDefined();
    });

    test('should fail when title is not provided', async () => {
      const threadData = {
        // title is missing
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow(/Thread title is required/);
    });

    test('should fail when title is too short', async () => {
      const threadData = {
        title: 'AB', // Less than 3 characters
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow(/Thread title must be at least 3 characters long/);
    });

    test('should fail when title is too long', async () => {
      const longTitle = 'A'.repeat(201); // 201 characters
      const threadData = {
        title: longTitle,
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow(/Thread title cannot exceed 200 characters/);
    });

    test('should fail when content is not provided', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        // content is missing
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow(/Thread content is required/);
    });

    test('should fail when content is too short', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'Too short', // Less than 10 characters
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow(/Thread content must be at least 10 characters long/);
    });

    test('should fail when category is not provided', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        // category is missing
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow(/Thread category is required/);
    });

    test('should fail when an invalid category is provided', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'invalid_category', // Not in enum
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow();
    });

    test('should fail when createdBy is not provided', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        // createdBy is missing
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow();
    });

    test('should fail when authorName is not provided', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        // authorName is missing
      };

      const thread = new ForumThread(threadData);
      
      await expect(thread.save()).rejects.toThrow();
    });

    test('should properly trim the title field', async () => {
      const threadData = {
        title: '  Test Forum Thread  ', // With extra spaces to be trimmed
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      const savedThread = await thread.save();

      expect(savedThread.title).toBe('Test Forum Thread'); // Spaces should be trimmed
    });

    test('should properly trim the content field', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: '  This is a test forum thread with sufficient content.  ', // With extra spaces to be trimmed
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      const savedThread = await thread.save();

      expect(savedThread.content).toBe('This is a test forum thread with sufficient content.'); // Spaces should be trimmed
    });
  });

  describe('Instance Methods', () => {
    test('incrementPostCount should increment post count and update lastReplyAt', async () => {
      // Create a thread
      const thread = await new ForumThread({
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      const originalPostCount = thread.postCount;
      const originalLastReplyAt = thread.lastReplyAt;
      
      // Wait a bit to ensure timestamps would be different
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Call the method
      await thread.incrementPostCount();
      
      // Verify post count was incremented
      expect(thread.postCount).toBe(originalPostCount + 1);
      
      // Verify lastReplyAt was updated
      expect(thread.lastReplyAt.getTime()).toBeGreaterThan(originalLastReplyAt.getTime());
    });

    test('incrementViewCount should increment view count', async () => {
      // Create a thread
      const thread = await new ForumThread({
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      const originalViewCount = thread.viewCount;
      
      // Call the method
      await thread.incrementViewCount();
      
      // Verify view count was incremented
      expect(thread.viewCount).toBe(originalViewCount + 1);
    });

    test('url virtual should return the correct URL path', async () => {
      // Create a thread
      const thread = await new ForumThread({
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Check the virtual
      expect(thread.url).toBe(`/forum/threads/${thread._id}`);
    });
  });

  describe('Static Methods', () => {
    test('findByCategory should return threads in the specified category with pagination', async () => {
      // Create multiple threads in different categories
      await new ForumThread({
        title: 'General Thread 1',
        content: 'This is a test forum thread in general category.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      await new ForumThread({
        title: 'General Thread 2',
        content: 'This is another test forum thread in general category.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      await new ForumThread({
        title: 'Help Thread 1',
        content: 'This is a test forum thread in help category.',
        category: 'help',
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Call the static method
      const generalThreads = await ForumThread.findByCategory('general');
      
      // Verify results
      expect(generalThreads).toHaveLength(2);
      expect(generalThreads[0].category).toBe('general');
      expect(generalThreads[1].category).toBe('general');
    });

    test('findByCategory should respect pagination parameters', async () => {
      // Create multiple threads in the same category
      for (let i = 0; i < 5; i++) {
        await new ForumThread({
          title: `General Thread ${i}`,
          content: `This is test forum thread ${i} in general category.`,
          category: 'general',
          createdBy: testUser._id,
          authorName: testUser.username
        }).save();
      }
      
      // Call the static method with pagination (limit 2, page 2)
      const page2Threads = await ForumThread.findByCategory('general', 2, 2);
      
      // Verify results
      expect(page2Threads).toHaveLength(2);
    });

    test('search should find threads matching the query string in title, content, or tags', async () => {
      // Create threads with different content
      await new ForumThread({
        title: 'Algebra Question',
        content: 'I need help with my algebra homework.',
        category: 'help',
        tags: ['math', 'algebra', 'homework'],
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      await new ForumThread({
        title: 'Geometry Class',
        content: 'This geometry class is very interesting.',
        category: 'discussion',
        tags: ['math', 'geometry'],
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      await new ForumThread({
        title: 'General Announcement',
        content: 'This is a general announcement for all students.',
        category: 'announcement',
        tags: ['general', 'announcement'],
        createdBy: testUser._id,
        authorName: testUser.username
      }).save();
      
      // Search for threads with "algebra"
      const algebraThreads = await ForumThread.search('algebra');
      expect(algebraThreads).toHaveLength(1);
      expect(algebraThreads[0].title).toBe('Algebra Question');
      
      // Search for threads with "math" in tags
      const mathThreads = await ForumThread.search('math');
      expect(mathThreads).toHaveLength(2);
      
      // Search for threads with "general" in content or title
      const generalThreads = await ForumThread.search('general');
      expect(generalThreads).toHaveLength(1);
      expect(generalThreads[0].title).toBe('General Announcement');
    });

    test('search should respect pagination parameters', async () => {
      // Create multiple threads with the same keyword
      for (let i = 0; i < 5; i++) {
        await new ForumThread({
          title: `Math Thread ${i}`,
          content: `This is test forum thread ${i} about mathematics.`,
          category: 'discussion',
          tags: ['math'],
          createdBy: testUser._id,
          authorName: testUser.username
        }).save();
      }
      
      // Call the search method with pagination (limit 2, page 2)
      const page2Threads = await ForumThread.search('math', 2, 2);
      
      // Verify results
      expect(page2Threads).toHaveLength(2);
    });
  });

  describe('Timestamps and Default Values', () => {
    test('should auto-generate createdAt, updatedAt and lastReplyAt fields', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const before = new Date();
      const thread = new ForumThread(threadData);
      const savedThread = await thread.save();
      const after = new Date();

      expect(savedThread.createdAt).toBeInstanceOf(Date);
      expect(savedThread.updatedAt).toBeInstanceOf(Date);
      expect(savedThread.lastReplyAt).toBeInstanceOf(Date);
      
      // Verify timestamps are within the expected range
      expect(savedThread.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedThread.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(savedThread.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedThread.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(savedThread.lastReplyAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedThread.lastReplyAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test('should set default values correctly', async () => {
      const threadData = {
        title: 'Test Forum Thread',
        content: 'This is a test forum thread with sufficient content.',
        category: 'general',
        createdBy: testUser._id,
        authorName: testUser.username
      };

      const thread = new ForumThread(threadData);
      const savedThread = await thread.save();

      expect(savedThread.postCount).toBe(1);
      expect(savedThread.isLocked).toBe(false);
      expect(savedThread.isPinned).toBe(false);
      expect(savedThread.viewCount).toBe(0);
    });
  });
}); 