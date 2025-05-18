const mongoose = require('mongoose');
const PracticeSet = require('../../models/PracticeSet');
const { ApiError } = require('../../middleware/errorHandler');
const { createTestUser } = require('../utils/testUtils');

// Now require the controller
const adminPracticeSetController = require('../../controllers/adminPracticeSetController');

describe('Admin Practice Set Controller Tests', () => {
  let testUser;
  let testAdmin;
  let testPracticeSet;

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
    
    // Create a test practice set
    testPracticeSet = new PracticeSet({
      title: 'Admin Test Practice Set',
      description: 'This is a test practice set for admin controller testing.',
      category: 'Algebra',
      topic: 'Linear Equations',
      difficulty: 'Intermediate',
      author: testAdmin._id,
      problems: [
        {
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: 'Addition of 2 and 2 equals 4.'
        },
        {
          question: 'Solve for x: 2x = 8',
          options: ['2', '4', '6', '8'],
          correctAnswer: '4',
          explanation: 'Dividing both sides by 2 gives x = 4.'
        }
      ],
      status: 'published'
    });
    await testPracticeSet.save();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Mock Express request and response objects
  const mockRequestResponse = () => {
    const req = {
      body: {},
      user: { _id: testAdmin._id, role: 'admin' },
      params: {},
      query: {}
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();
    
    return { req, res, next };
  };

  describe('createPracticeSet', () => {
    test('should create a new practice set successfully', async () => {
      const { req, res, next } = mockRequestResponse();
      
      req.body = {
        title: 'New Admin Practice Set',
        description: 'This is a practice set created through the admin controller.',
        category: 'Calculus',
        topic: 'Differential Equations',
        difficulty: 'Advanced',
        problems: [
          {
            question: 'What is the derivative of x²?',
            options: ['x', '2x', '2', 'x²'],
            correctAnswer: '2x',
            explanation: 'The derivative of x² is 2x.'
          }
        ]
      };

      await adminPracticeSetController.createPracticeSet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: {
            practiceSet: expect.objectContaining({
              title: 'New Admin Practice Set',
              description: 'This is a practice set created through the admin controller.',
              category: 'Calculus',
              topic: 'Differential Equations',
              difficulty: 'Advanced',
              author: testAdmin._id
            })
          }
        })
      );

      // Verify practice set was created in database
      const practiceSet = await PracticeSet.findOne({ title: 'New Admin Practice Set' });
      expect(practiceSet).toBeTruthy();
      expect(practiceSet.author.toString()).toBe(testAdmin._id.toString());
    });

    test('should handle validation errors through next middleware', async () => {
      const { req, res, next } = mockRequestResponse();
      
      req.body = {
        // Missing required fields like title, description
        difficulty: 'Advanced'
      };

      // Mock Model.create to throw ValidationError
      const mockValidationError = new mongoose.Error.ValidationError();
      mockValidationError.errors = {
        title: new mongoose.Error.ValidatorError({ message: 'Title is required' })
      };
      
      jest.spyOn(PracticeSet, 'create').mockRejectedValueOnce(mockValidationError);

      await adminPracticeSetController.createPracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toContain('Title is required');

      // Restore mock
      PracticeSet.create.mockRestore();
    });

    test('should handle general errors through next middleware', async () => {
      const { req, res, next } = mockRequestResponse();
      
      req.body = {
        title: 'Error Practice Set',
        description: 'This should trigger an error.',
        category: 'Algebra',
        topic: 'Error Testing',
        difficulty: 'Beginner'
      };

      // Mock database error
      jest.spyOn(PracticeSet, 'create').mockRejectedValueOnce(new Error('Database error'));

      await adminPracticeSetController.createPracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Database error');

      // Restore mock
      PracticeSet.create.mockRestore();
    });
  });

  describe('getPracticeSets', () => {
    beforeEach(async () => {
      // Create additional test practice sets with different attributes
      await new PracticeSet({
        title: 'Admin Algebra Basics',
        description: 'Basic algebra concepts for testing.',
        category: 'Algebra',
        topic: 'Basic Algebra',
        difficulty: 'Beginner',
        author: testAdmin._id,
        problems: [
          {
            question: 'What is 5 + 7?',
            options: ['10', '11', '12', '13'],
            correctAnswer: '12',
            explanation: 'Addition of 5 and 7 equals 12.'
          }
        ],
        status: 'published'
      }).save();

      await new PracticeSet({
        title: 'Admin Calculus Overview',
        description: 'Overview of calculus for testing the admin controller.',
        category: 'Calculus',
        topic: 'Calculus Basics',
        difficulty: 'Intermediate',
        author: testAdmin._id,
        problems: [
          {
            question: 'Find the derivative of f(x) = x²',
            options: ['f\'(x) = x', 'f\'(x) = 2x', 'f\'(x) = 2', 'f\'(x) = x²'],
            correctAnswer: 'f\'(x) = 2x',
            explanation: 'The derivative of x² is 2x.'
          }
        ],
        status: 'draft'
      }).save();

      await new PracticeSet({
        title: 'Admin Geometry Introduction',
        description: 'Introduction to geometry for admin testing.',
        category: 'Geometry',
        topic: 'Geometry Basics',
        difficulty: 'Beginner',
        author: testUser._id, // Different author
        problems: [
          {
            question: 'What is the formula for the area of a circle?',
            options: ['A = πr', 'A = πr²', 'A = 2πr', 'A = πd'],
            correctAnswer: 'A = πr²',
            explanation: 'The area of a circle is pi times the radius squared.'
          }
        ],
        status: 'published'
      }).save();
    });

    test('should get all practice sets with default pagination', async () => {
      const { req, res, next } = mockRequestResponse();
      
      await adminPracticeSetController.getPracticeSets(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.status).toBe('success');
      expect(responseBody.data.practiceSets).toHaveLength(4); // All 4 practice sets regardless of status
      expect(responseBody.total).toBe(4);
      expect(responseBody.currentPage).toBe(1);
    });

    test('should filter practice sets based on query parameters', async () => {
      const { req, res, next } = mockRequestResponse();
      req.query = { category: 'Algebra' };
      
      await adminPracticeSetController.getPracticeSets(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.data.practiceSets.every(set => set.category === 'Algebra')).toBe(true);
      expect(responseBody.data.practiceSets.length).toBe(2); // 2 Algebra practice sets
    });

    test('should apply sorting from query parameters', async () => {
      const { req, res, next } = mockRequestResponse();
      req.query = { sort: 'title' }; // Sort by title ascending
      
      await adminPracticeSetController.getPracticeSets(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseBody = res.json.mock.calls[0][0];
      const titles = responseBody.data.practiceSets.map(set => set.title);
      const sortedTitles = [...titles].sort();
      
      expect(titles).toEqual(sortedTitles);
    });

    test('should apply field limiting from query parameters', async () => {
      const { req, res, next } = mockRequestResponse();
      req.query = { fields: 'title,category' };
      
      await adminPracticeSetController.getPracticeSets(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseBody = res.json.mock.calls[0][0];
      const firstPracticeSet = responseBody.data.practiceSets[0];
      
      // Only specified fields should be included
      expect(firstPracticeSet).toHaveProperty('title');
      expect(firstPracticeSet).toHaveProperty('category');
      
      // Other fields should be excluded
      expect(firstPracticeSet).not.toHaveProperty('description');
      expect(firstPracticeSet).not.toHaveProperty('difficulty');
    });

    test('should process search query for title or description', async () => {
      const { req, res, next } = mockRequestResponse();
      req.query = { search: 'Algebra' };
      
      await adminPracticeSetController.getPracticeSets(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.data.practiceSets.length).toBeGreaterThan(0);
      
      // Check that search results are relevant
      const hasAlgebra = responseBody.data.practiceSets.every(set => 
        set.title.includes('Algebra') || 
        set.category === 'Algebra' ||
        set.description.includes('algebra')
      );
      expect(hasAlgebra).toBe(true);
    });

    test('should apply pagination correctly', async () => {
      const { req, res, next } = mockRequestResponse();
      req.query = { page: 1, limit: 2 };
      
      await adminPracticeSetController.getPracticeSets(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.data.practiceSets.length).toBe(2);
      expect(responseBody.currentPage).toBe(1);
      expect(responseBody.totalPages).toBe(2); // 4 practice sets with limit 2 should be 2 pages
    });

    test('should handle errors through next middleware', async () => {
      const { req, res, next } = mockRequestResponse();
      
      // Mock database error
      jest.spyOn(PracticeSet, 'find').mockImplementationOnce(() => {
        throw new Error('Database query error');
      });

      await adminPracticeSetController.getPracticeSets(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Database query error');

      // Restore mock
      PracticeSet.find.mockRestore();
    });
  });

  describe('getPracticeSet', () => {
    test('should get a specific practice set by ID', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };
      
      await adminPracticeSetController.getPracticeSet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: {
            practiceSet: expect.objectContaining({
              _id: expect.any(mongoose.Types.ObjectId),
              title: 'Admin Test Practice Set',
              description: 'This is a test practice set for admin controller testing.',
              topic: 'Linear Equations',
              category: 'Algebra'
            })
          }
        })
      );
    });

    test('should return 404 through next middleware for non-existent practice set ID', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      
      await adminPracticeSetController.getPracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Practice set not found');
    });

    test('should handle database errors through next middleware', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };
      
      // Mock database error
      jest.spyOn(PracticeSet, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await adminPracticeSetController.getPracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Database error');

      // Restore mock
      PracticeSet.findById.mockRestore();
    });
  });

  describe('updatePracticeSet', () => {
    test('should update a practice set successfully', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };
      req.body = {
        title: 'Updated Admin Practice Set',
        description: 'This content has been updated through the admin controller.',
        difficulty: 'Advanced'
      };
      
      await adminPracticeSetController.updatePracticeSet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: {
            practiceSet: expect.objectContaining({
              title: 'Updated Admin Practice Set',
              description: 'This content has been updated through the admin controller.',
              difficulty: 'Advanced'
            })
          }
        })
      );
      
      // Verify database was updated
      const updatedPracticeSet = await PracticeSet.findById(testPracticeSet._id);
      expect(updatedPracticeSet.title).toBe('Updated Admin Practice Set');
      expect(updatedPracticeSet.difficulty).toBe('Advanced');
    });

    test('should return 404 through next middleware for non-existent practice set', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      req.body = { title: 'Update Non-existent Practice Set' };
      
      await adminPracticeSetController.updatePracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Practice set not found');
    });

    test('should handle validation errors through next middleware', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };
      req.body = { category: 'InvalidCategory' }; // Invalid category
      
      // Mock the findByIdAndUpdate to trigger validation error
      const mockValidationError = new mongoose.Error.ValidationError();
      mockValidationError.errors = {
        category: new mongoose.Error.ValidatorError({ message: 'Invalid category' })
      };
      
      jest.spyOn(PracticeSet, 'findByIdAndUpdate').mockRejectedValueOnce(mockValidationError);

      await adminPracticeSetController.updatePracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toContain('Invalid category');

      // Restore mock
      PracticeSet.findByIdAndUpdate.mockRestore();
    });

    test('should handle general errors through next middleware', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };
      req.body = { title: 'Error Update' };
      
      // Mock database error
      jest.spyOn(PracticeSet, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await adminPracticeSetController.updatePracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Database error');

      // Restore mock
      PracticeSet.findById.mockRestore();
    });
  });

  describe('deletePracticeSet', () => {
    test('should delete a practice set successfully (soft delete)', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };

      // Mock findByIdAndUpdate to simulate soft delete and return updated document
      jest.spyOn(PracticeSet, 'findByIdAndUpdate').mockResolvedValueOnce({
        ...testPracticeSet.toObject(),
        status: 'archived'
      });

      // Call the controller method
      await adminPracticeSetController.deletePracticeSet(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: null
        })
      );

      // Restore mock
      PracticeSet.findByIdAndUpdate.mockRestore();
    });

    test('should return 404 through next middleware for non-existent practice set', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      
      await adminPracticeSetController.deletePracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Practice set not found');
    });

    test('should handle errors through next middleware', async () => {
      const { req, res, next } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };
      
      // Mock database error
      jest.spyOn(PracticeSet, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await adminPracticeSetController.deletePracticeSet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Database error');

      // Restore mock
      PracticeSet.findById.mockRestore();
    });
  });
}); 