const mongoose = require('mongoose');
const Feedback = require('../../models/Feedback');
const User = require('../../models/User');
const { createTestUser } = require('../utils/testUtils');

describe('Feedback Model Tests', () => {
  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Schema Validation', () => {
    test('should create a valid feedback with userId', async () => {
      // Create a test user first
      const user = await createTestUser();

      const feedbackData = {
        userId: user._id,
        message: 'This is a test feedback',
        context: {
          page: 'lesson-page'
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.userId.toString()).toBe(user._id.toString());
      expect(savedFeedback.message).toBe(feedbackData.message);
      expect(savedFeedback.context.page).toBe(feedbackData.context.page);
      expect(savedFeedback.status).toBe(feedbackData.status);
      expect(savedFeedback.createdAt).toBeDefined();
      expect(savedFeedback.updatedAt).toBeDefined();
    });

    test('should create a valid feedback with email', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.email).toBe(feedbackData.email);
      expect(savedFeedback.message).toBe(feedbackData.message);
      expect(savedFeedback.status).toBe(feedbackData.status);
    });

    test('should create a valid feedback with both userId and email', async () => {
      const user = await createTestUser();

      const feedbackData = {
        userId: user._id,
        email: 'test@example.com',
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.userId.toString()).toBe(user._id.toString());
      expect(savedFeedback.email).toBe(feedbackData.email);
    });

    test('should fail when neither userId nor email is provided', async () => {
      const feedbackData = {
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow();
    });

    test('should fail when message is not provided', async () => {
      const feedbackData = {
        email: 'test@example.com',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow(/Feedback message is required/);
    });

    test('should fail when message is too short', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'Hi', // Less than 3 characters
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow(/Feedback message must be at least 3 characters/);
    });

    test('should fail when message is too long', async () => {
      const longMessage = 'A'.repeat(5001); // 5001 characters
      const feedbackData = {
        email: 'test@example.com',
        message: longMessage,
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow(/Feedback message cannot exceed 5000 characters/);
    });

    test('should use default status when not provided', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback'
        // No status provided, should default to 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback.status).toBe('New');
    });

    test('should fail when invalid status is provided', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        status: 'Invalid Status' // Not in enum
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow(/is not a valid status/);
    });

    test('should fail when email format is invalid', async () => {
      const feedbackData = {
        email: 'invalid-email', // Invalid email format
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow(/Please enter a valid email address/);
    });

    test('should pass with empty email when userId is provided', async () => {
      const user = await createTestUser();

      const feedbackData = {
        userId: user._id,
        email: '', // Empty email is allowed if userId exists
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.email).toBe('');
    });

    test('should allow null or undefined email when userId is provided', async () => {
      const user = await createTestUser();

      const feedbackData = {
        userId: user._id,
        email: null, // Null email is allowed if userId exists
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.email).toBeNull();

      // Test with undefined email
      const undefinedEmailData = {
        userId: user._id,
        message: 'This is a test feedback',
        status: 'New'
        // email is undefined
      };

      const undefinedEmailFeedback = new Feedback(undefinedEmailData);
      const savedUndefinedEmailFeedback = await undefinedEmailFeedback.save();

      expect(savedUndefinedEmailFeedback._id).toBeDefined();
      expect(savedUndefinedEmailFeedback.email).toBeUndefined();
    });
  });

  describe('Context Validation', () => {
    test('should create feedback with valid page context', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback with page context',
        context: {
          page: '/lessons/algebra-basics'
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback.context.page).toBe(feedbackData.context.page);
    });

    test('should fail when page context is too long', async () => {
      const longPageContext = 'A'.repeat(101); // 101 characters
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        context: {
          page: longPageContext
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow(/Page context cannot exceed 100 characters/);
    });

    test('should create feedback with valid lessonId context', async () => {
      const lessonId = new mongoose.Types.ObjectId();
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback about a lesson',
        context: {
          lessonId
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback.context.lessonId.toString()).toBe(lessonId.toString());
    });

    test('should create feedback with valid practiceSetId context', async () => {
      const practiceSetId = new mongoose.Types.ObjectId();
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback about a practice set',
        context: {
          practiceSetId
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback.context.practiceSetId.toString()).toBe(practiceSetId.toString());
    });

    test('should create feedback with multiple context properties', async () => {
      const lessonId = new mongoose.Types.ObjectId();
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback with multiple contexts',
        context: {
          page: '/lessons/algebra',
          lessonId
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback.context.page).toBe(feedbackData.context.page);
      expect(savedFeedback.context.lessonId.toString()).toBe(lessonId.toString());
    });

    test('should fail when lessonId format is invalid', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        context: {
          lessonId: 'invalid-id' // Invalid ObjectId format
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      // Mongoose throws a CastError for invalid ObjectId format
      await expect(feedback.save()).rejects.toThrow(/Cast to ObjectId failed/);
    });

    test('should fail when practiceSetId format is invalid', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        context: {
          practiceSetId: 'invalid-id' // Invalid ObjectId format
        },
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      // Mongoose throws a CastError for invalid ObjectId format
      await expect(feedback.save()).rejects.toThrow(/Cast to ObjectId failed/);
    });
  });

  describe('Admin Notes Validation', () => {
    test('should create feedback with admin notes', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        status: 'Read',
        adminNotes: 'These are admin notes for this feedback'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback.adminNotes).toBe(feedbackData.adminNotes);
    });

    test('should fail when admin notes are too long', async () => {
      const longAdminNotes = 'A'.repeat(1001); // 1001 characters
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        status: 'New',
        adminNotes: longAdminNotes
      };

      const feedback = new Feedback(feedbackData);
      
      await expect(feedback.save()).rejects.toThrow(/Admin notes cannot exceed 1000 characters/);
    });
  });

  describe('Pre-validate Hook', () => {
    test('should invalidate when neither userId nor email is provided', async () => {
      const feedbackData = {
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      
      let validationError;
      try {
        await feedback.validate();
      } catch (error) {
        validationError = error;
      }

      expect(validationError).toBeDefined();
      expect(validationError.errors.email.message).toBe('Either user ID or email must be provided');
    });
  });

  describe('Timestamps', () => {
    test('should auto-generate createdAt and updatedAt fields', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        status: 'New'
      };

      const before = new Date();
      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();
      const after = new Date();

      expect(savedFeedback.createdAt).toBeInstanceOf(Date);
      expect(savedFeedback.updatedAt).toBeInstanceOf(Date);
      
      // Verify timestamps are within the expected range
      expect(savedFeedback.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedFeedback.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(savedFeedback.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedFeedback.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test('should update the updatedAt field on modification', async () => {
      // Create initial feedback
      const feedbackData = {
        email: 'test@example.com',
        message: 'This is a test feedback',
        status: 'New'
      };

      const feedback = new Feedback(feedbackData);
      const savedFeedback = await feedback.save();
      
      // Store the original timestamps
      const originalCreatedAt = savedFeedback.createdAt;
      const originalUpdatedAt = savedFeedback.updatedAt;
      
      // Wait a bit to ensure timestamps would be different
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Update the feedback
      savedFeedback.status = 'Read';
      await savedFeedback.save();
      
      // Verify timestamps
      expect(savedFeedback.createdAt.getTime()).toBe(originalCreatedAt.getTime()); // createdAt should not change
      expect(savedFeedback.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime()); // updatedAt should be updated
    });
  });
}); 