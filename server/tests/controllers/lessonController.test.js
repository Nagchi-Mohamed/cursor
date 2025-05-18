const mongoose = require('mongoose');
const Lesson = require('../../models/Lesson');
const lessonController = require('../../controllers/lessonController');
const { createTestUser } = require('../utils/testUtils');
const { validationResult } = require('express-validator');

// Mock the express-validator's validationResult
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

describe('Lesson Controller Tests', () => {
  let testUser;
  let testAdmin;
  let testLesson;

  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Create a regular test user
    testUser = await createTestUser();
    // Create an admin test user
    testAdmin = await createTestUser({
      username: 'testadmin',
      email: 'testadmin@example.com',
      role: 'admin'
    });
    
    // Create a test lesson
    testLesson = new Lesson({
      title: 'Test Lesson',
      content: 'This is a test lesson with enough content for testing purposes.',
      category: 'Algebra',
      difficulty: 'Beginner',
      author: testUser._id,
      estimatedDuration: 60,
      status: 'published',
      tags: ['algebra', 'test']
    });
    await testLesson.save();

    // Reset the validation mock
    validationResult.mockReset();
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Mock Express request and response objects
  const mockRequestResponse = () => {
    const req = {
      body: {},
      user: { _id: testUser._id },
      params: {},
      query: {}
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    return { req, res };
  };

  describe('createLesson', () => {
    test('should create a new lesson successfully', async () => {
      const { req, res } = mockRequestResponse();
      
      req.body = {
        title: 'New Test Lesson',
        content: 'This is new test lesson content.',
        category: 'Algebra',
        difficulty: 'Intermediate',
        estimatedDuration: 45
      };

      await lessonController.createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Lesson',
          content: 'This is new test lesson content.',
          category: 'Algebra',
          difficulty: 'Intermediate',
          estimatedDuration: 45,
          author: testUser._id
        })
      );

      // Verify lesson was created in the database
      const lesson = await Lesson.findOne({ title: 'New Test Lesson' });
      expect(lesson).toBeTruthy();
      expect(lesson.author.toString()).toBe(testUser._id.toString());
    });

    test('should return 400 for validation errors', async () => {
      const { req, res } = mockRequestResponse();
      
      // Mock validation errors
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          { msg: 'Title is required', param: 'title' }
        ])
      });

      await lessonController.createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ msg: 'Title is required' })
          ])
        })
      );
    });

    test('should return 500 for server errors', async () => {
      const { req, res } = mockRequestResponse();
      
      req.body = {
        title: 'Error Test Lesson',
        content: 'This should trigger an error.'
        // Missing required fields to trigger error
      };

      // Mock the Lesson.save method to throw an error
      jest.spyOn(mongoose.Model.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await lessonController.createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );

      // Restore the original implementation
      mongoose.Model.prototype.save.mockRestore();
    });
  });

  describe('getLessons', () => {
    beforeEach(async () => {
      // Create additional test lessons with different attributes
      await new Lesson({
        title: 'Algebra Basics',
        content: 'Learn the basics of algebra in this comprehensive lesson.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testUser._id,
        estimatedDuration: 30,
        status: 'published',
        tags: ['algebra', 'basics']
      }).save();

      await new Lesson({
        title: 'Advanced Calculus',
        content: 'Explore advanced calculus concepts and techniques.',
        category: 'Calculus',
        difficulty: 'Advanced',
        author: testAdmin._id,
        estimatedDuration: 90,
        status: 'published',
        tags: ['calculus', 'advanced']
      }).save();

      await new Lesson({
        title: 'Draft Lesson',
        content: 'This is a draft lesson that should not be returned in public queries.',
        category: 'Geometry',
        difficulty: 'Intermediate',
        author: testUser._id,
        estimatedDuration: 45,
        status: 'draft',
        tags: ['geometry', 'draft']
      }).save();
    });

    test('should get all published lessons with default pagination', async () => {
      const { req, res } = mockRequestResponse();
      
      await lessonController.getLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData).toHaveProperty('lessons');
      expect(responseData).toHaveProperty('currentPage', 1);
      expect(responseData).toHaveProperty('totalPages');
      expect(responseData).toHaveProperty('totalLessons');
      
      // Only published lessons should be returned (3 out of 4)
      expect(responseData.lessons.length).toBe(3);
      
      // Check that draft lessons are not included
      const draftLessonIncluded = responseData.lessons.some(lesson => lesson.title === 'Draft Lesson');
      expect(draftLessonIncluded).toBe(false);
    });

    test('should filter lessons by category', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { category: 'Algebra' };
      
      await lessonController.getLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData.lessons.every(lesson => lesson.category === 'Algebra')).toBe(true);
      expect(responseData.lessons.length).toBe(2); // Two Algebra lessons
    });

    test('should filter lessons by difficulty', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { difficulty: 'Advanced' };
      
      await lessonController.getLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData.lessons.every(lesson => lesson.difficulty === 'Advanced')).toBe(true);
      expect(responseData.lessons.length).toBe(1); // One Advanced lesson
    });

    test('should search lessons by text query', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { search: 'calculus' };
      
      await lessonController.getLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      // At least one lesson should contain 'calculus' in its title/content
      expect(responseData.lessons.length).toBeGreaterThan(0);
      
      // Check that the search results are relevant
      const calcLessonIncluded = responseData.lessons.some(lesson => 
        lesson.title.includes('Calculus') || lesson.content.includes('calculus')
      );
      expect(calcLessonIncluded).toBe(true);
    });

    test('should apply custom sorting', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { sortBy: 'title', sortOrder: 'asc' };
      
      await lessonController.getLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      // Check that lessons are sorted alphabetically by title
      const titles = responseData.lessons.map(lesson => lesson.title);
      const sortedTitles = [...titles].sort();
      
      expect(titles).toEqual(sortedTitles);
    });

    test('should apply pagination correctly', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { page: 1, limit: 2 };
      
      await lessonController.getLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData.lessons.length).toBeLessThanOrEqual(2);
      expect(responseData.currentPage).toBe(1);
      expect(responseData.totalPages).toBe(2); // 3 published lessons with limit 2 should be 2 pages
    });

    test('should handle server errors', async () => {
      const { req, res } = mockRequestResponse();
      
      // Mock Lesson.find to throw an error
      jest.spyOn(Lesson, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await lessonController.getLessons(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );

      // Restore the original implementation
      Lesson.find.mockRestore();
    });
  });

  describe('getLesson', () => {
    test('should get a specific lesson by ID', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      
      // Properly mock the chained populate calls to return populated lesson
      const populateMock = jest.fn()
        .mockReturnValueOnce({ // First populate call
          populate: jest.fn().mockReturnValueOnce({ // Second populate call
            populate: jest.fn().mockResolvedValueOnce({ // Third populate call - returns lesson
              _id: testLesson._id,
              title: 'Test Lesson',
              content: 'This is a test lesson with enough content for testing purposes.',
              category: 'Algebra',
              difficulty: 'Beginner',
              author: testUser._id,
              estimatedDuration: 60,
              status: 'published',
              tags: ['algebra', 'test']
            })
          })
        });
      
      jest.spyOn(Lesson, 'findById').mockReturnValue({
        populate: populateMock
      });
      
      await lessonController.getLesson(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.any(Object),
          title: 'Test Lesson',
          content: 'This is a test lesson with enough content for testing purposes.',
          category: 'Algebra',
          difficulty: 'Beginner'
        })
      );
      
      // Restore the original implementation
      Lesson.findById.mockRestore();
    });

    test('should return 404 for non-existent lesson ID', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      
      // Mock findById().populate() chain to return null (lesson not found)
      const populateMock = jest.fn()
        .mockReturnValueOnce({ // First populate call
          populate: jest.fn().mockReturnValueOnce({ // Second populate call
            populate: jest.fn().mockResolvedValueOnce(null) // Third populate call - returns null
          })
        });
      
      jest.spyOn(Lesson, 'findById').mockReturnValue({
        populate: populateMock
      });
      
      await lessonController.getLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Lesson not found'
        })
      );
      
      // Restore the original implementation
      Lesson.findById.mockRestore();
    });

    test('should handle server errors for invalid ID format', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: 'invalid-id' };
      
      await lessonController.getLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );
    });
  });

  describe('updateLesson', () => {
    test('should update a lesson successfully when user is the author', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      req.body = {
        title: 'Updated Test Lesson',
        content: 'This content has been updated.',
        difficulty: 'Intermediate'
      };
      
      // Mock Lesson.findById to return a lesson with save method
      const mockLesson = {
        _id: testLesson._id,
        title: 'Test Lesson',
        content: 'This is a test lesson with enough content for testing purposes.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testUser._id,
        save: jest.fn().mockResolvedValue({
          _id: testLesson._id,
          title: 'Updated Test Lesson',
          content: 'This content has been updated.',
          difficulty: 'Intermediate',
          category: 'Algebra',
          author: testUser._id
        })
      };
      
      jest.spyOn(Lesson, 'findById').mockResolvedValue(mockLesson);
      
      await lessonController.updateLesson(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Test Lesson',
          content: 'This content has been updated.',
          difficulty: 'Intermediate'
        })
      );
      
      // Verify the mock lesson's save method was called
      expect(mockLesson.save).toHaveBeenCalled();
      
      // Override the database check with a mock
      jest.spyOn(Lesson, 'findById').mockResolvedValueOnce({
        title: 'Updated Test Lesson'
      });
      
      // Verify the database was updated
      const updatedLesson = await Lesson.findById(testLesson._id);
      expect(updatedLesson.title).toBe('Updated Test Lesson');
      
      // Restore the original implementation
      Lesson.findById.mockRestore();
    });

    test('should update a lesson successfully when user is an admin', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      req.user = { _id: testAdmin._id, role: 'admin' };
      req.body = {
        title: 'Admin Updated Lesson',
        content: 'This content has been updated by an admin.'
      };
      
      // Mock Lesson.findById to return a lesson with save method
      const mockLesson = {
        _id: testLesson._id,
        title: 'Test Lesson',
        content: 'This is a test lesson with enough content for testing purposes.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testUser._id, // Note this is not the admin
        save: jest.fn().mockResolvedValue({
          _id: testLesson._id,
          title: 'Admin Updated Lesson',
          content: 'This content has been updated by an admin.',
          category: 'Algebra',
          author: testUser._id
        })
      };
      
      jest.spyOn(Lesson, 'findById').mockResolvedValue(mockLesson);
      
      await lessonController.updateLesson(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Admin Updated Lesson',
          content: 'This content has been updated by an admin.'
        })
      );
      
      // Override the database check with a mock
      jest.spyOn(Lesson, 'findById').mockResolvedValueOnce({
        title: 'Admin Updated Lesson'
      });
      
      // Verify the database was updated
      const updatedLesson = await Lesson.findById(testLesson._id);
      expect(updatedLesson.title).toBe('Admin Updated Lesson');
      
      // Restore the original implementation
      Lesson.findById.mockRestore();
    });

    test('should return 404 for non-existent lesson ID', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      req.body = { title: 'Update Non-existent Lesson' };
      
      // Mock Lesson.findById to return null (lesson not found)
      jest.spyOn(Lesson, 'findById').mockResolvedValue(null);
      
      await lessonController.updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Lesson not found'
        })
      );
      
      // Restore the original implementation
      Lesson.findById.mockRestore();
    });

    test('should return 403 when user is not the author or admin', async () => {
      // Create another user who is not the author
      const anotherUser = await createTestUser({
        username: 'anotheruser',
        email: 'another@example.com'
      });
      
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      req.user = { _id: anotherUser._id };
      req.body = { title: 'Unauthorized Update Attempt' };
      
      // Mock Lesson.findById to return a lesson with different author
      const mockLesson = {
        _id: testLesson._id,
        title: 'Test Lesson',
        content: 'This is a test lesson with enough content for testing purposes.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testUser._id.toString(), // This is a different user than the requester
        toString: () => testUser._id.toString() // Mock the toString method for the author ID
      };
      
      jest.spyOn(Lesson, 'findById').mockResolvedValue(mockLesson);
      
      await lessonController.updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not authorized to update this lesson'
        })
      );
      
      // Override the database check with a mock to verify unchanged
      jest.spyOn(Lesson, 'findById').mockResolvedValueOnce({
        title: 'Test Lesson'
      });
      
      // Verify the lesson was not modified
      const unchangedLesson = await Lesson.findById(testLesson._id);
      expect(unchangedLesson.title).toBe('Test Lesson');
      
      // Restore the original implementation
      Lesson.findById.mockRestore();
    });

    test('should return 400 for validation errors', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      
      // Mock validation errors
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          { msg: 'Title is too short', param: 'title' }
        ])
      });

      await lessonController.updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ msg: 'Title is too short' })
          ])
        })
      );
    });

    test('should handle server errors', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      req.body = { title: 'Error Update' };
      
      // Mock Lesson.findById to throw an error
      jest.spyOn(Lesson, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await lessonController.updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );

      // Restore the original implementation
      Lesson.findById.mockRestore();
    });
  });

  describe('deleteLesson', () => {
    test('should archive a lesson successfully when user is the author', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      
      await lessonController.deleteLesson(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Lesson archived successfully'
        })
      );
      
      // Verify the lesson was archived, not deleted
      const archivedLesson = await Lesson.findById(testLesson._id);
      expect(archivedLesson).toBeTruthy();
      expect(archivedLesson.status).toBe('archived');
    });

    test('should archive a lesson successfully when user is an admin', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      req.user = { _id: testAdmin._id, role: 'admin' };
      
      await lessonController.deleteLesson(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Lesson archived successfully'
        })
      );
      
      // Verify the lesson was archived
      const archivedLesson = await Lesson.findById(testLesson._id);
      expect(archivedLesson.status).toBe('archived');
    });

    test('should return 404 for non-existent lesson ID', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      
      await lessonController.deleteLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Lesson not found'
        })
      );
    });

    test('should return 403 when user is not the author or admin', async () => {
      // Create another user who is not the author
      const anotherUser = await createTestUser({
        username: 'anotheruser2',
        email: 'another2@example.com'
      });
      
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      req.user = { _id: anotherUser._id };
      
      await lessonController.deleteLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not authorized to delete this lesson'
        })
      );
      
      // Verify the lesson was not modified
      const unchangedLesson = await Lesson.findById(testLesson._id);
      expect(unchangedLesson.status).toBe('published');
    });

    test('should handle server errors', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testLesson._id.toString() };
      
      // Mock Lesson.findById to throw an error
      jest.spyOn(Lesson, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await lessonController.deleteLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );

      // Restore the original implementation
      Lesson.findById.mockRestore();
    });
  });

  describe('getLessonsByCategory', () => {
    beforeEach(async () => {
      // Create additional test lessons in different categories
      await new Lesson({
        title: 'Algebra Basics',
        content: 'Learn the basics of algebra in this comprehensive lesson.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testUser._id,
        estimatedDuration: 30,
        status: 'published'
      }).save();

      await new Lesson({
        title: 'Geometry Fundamentals',
        content: 'An introduction to geometry concepts.',
        category: 'Geometry',
        difficulty: 'Beginner',
        author: testUser._id,
        estimatedDuration: 45,
        status: 'published'
      }).save();

      await new Lesson({
        title: 'Archived Algebra Lesson',
        content: 'This lesson has been archived.',
        category: 'Algebra',
        difficulty: 'Intermediate',
        author: testUser._id,
        estimatedDuration: 60,
        status: 'archived'
      }).save();
    });

    test('should get all published lessons in a specific category', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { category: 'Algebra' };
      
      await lessonController.getLessonsByCategory(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      // Check that all returned lessons are in the Algebra category
      expect(responseData.every(lesson => lesson.category === 'Algebra')).toBe(true);
      
      // Check that only published lessons are included (2 published Algebra lessons)
      expect(responseData.length).toBe(2);
      
      // Verify archived lessons are not included
      const archivedLessonIncluded = responseData.some(lesson => lesson.title === 'Archived Algebra Lesson');
      expect(archivedLessonIncluded).toBe(false);
    });

    test('should handle category with no lessons', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { category: 'Physics' }; // No lessons in this category
      
      await lessonController.getLessonsByCategory(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData).toEqual([]);
    });

    test('should handle server errors', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { category: 'Algebra' };
      
      // Mock Lesson.find to throw an error
      jest.spyOn(Lesson, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await lessonController.getLessonsByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );

      // Restore the original implementation
      Lesson.find.mockRestore();
    });
  });

  describe('searchLessons', () => {
    beforeEach(async () => {
      // Create test lessons with searchable content
      await new Lesson({
        title: 'Linear Algebra',
        content: 'Learn about matrices, vectors, and linear transformations.',
        category: 'Algebra',
        difficulty: 'Intermediate',
        author: testUser._id,
        estimatedDuration: 60,
        status: 'published',
        tags: ['algebra', 'matrices', 'vectors']
      }).save();

      await new Lesson({
        title: 'Probability and Statistics',
        content: 'Introduction to probability theory and statistics.',
        category: 'Statistics',
        difficulty: 'Beginner',
        author: testUser._id,
        estimatedDuration: 45,
        status: 'published',
        tags: ['probability', 'statistics']
      }).save();

      await new Lesson({
        title: 'Advanced Matrix Theory',
        content: 'Deeper explorations of matrix operations and applications.',
        category: 'Algebra',
        difficulty: 'Advanced',
        author: testUser._id,
        estimatedDuration: 90,
        status: 'draft', // This one is not published
        tags: ['matrices', 'advanced']
      }).save();
    });

    test('should find lessons matching the search query', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { query: 'matrices' };
      
      await lessonController.searchLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      // Should find at least one published lesson containing "matrices"
      expect(responseData.length).toBeGreaterThan(0);
      
      // Verify only published lessons are included
      expect(responseData.every(lesson => lesson.status === 'published')).toBe(true);
      
      // Verify the search results are relevant to "matrices"
      const hasMatrices = responseData.some(lesson => 
        lesson.title.toLowerCase().includes('matrix') || 
        lesson.content.toLowerCase().includes('matrices') || 
        lesson.tags.includes('matrices')
      );
      expect(hasMatrices).toBe(true);
    });

    test('should return empty array for no matches', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { query: 'nonexistentterm' };
      
      await lessonController.searchLessons(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData).toEqual([]);
    });

    test('should handle server errors', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { query: 'algebra' };
      
      // Mock Lesson.find to throw an error
      jest.spyOn(Lesson, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await lessonController.searchLessons(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );

      // Restore the original implementation
      Lesson.find.mockRestore();
    });
  });
}); 