const mongoose = require('mongoose');
const PracticeSet = require('../../models/PracticeSet');
const User = require('../../models/User');
const Lesson = require('../../models/Lesson');
const practiceSetController = require('../../controllers/practiceSetController');
const { createTestUser, createTestAdmin } = require('../utils/testUtils');
const { validationResult } = require('express-validator');

// Mock the express-validator's validationResult
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

describe('Practice Set Controller Tests', () => {
  let testUser;
  let testAdmin;
  let testLesson;
  let testPracticeSet;

  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Create a regular test user
    testUser = await createTestUser();
    // Create an admin test user
    testAdmin = await createTestAdmin();

    // Create a test lesson with required fields
    testLesson = new Lesson({
      title: 'Test Lesson',
      content: 'This is a test lesson content.',
      category: 'Algebra',
      author: testUser._id,
      estimatedDuration: 60
    });
    await testLesson.save();
    
    // Create a test practice set
    testPracticeSet = new PracticeSet({
      title: 'Test Practice Set',
      description: 'This is a test practice set with enough description for testing purposes.',
      category: 'Algebra',
      topic: 'Linear Equations',
      difficulty: 'Beginner',
      author: testUser._id,
      lesson: testLesson._id,
      questions: [
        {
          questionText: 'What is 2 + 2?',
          questionType: 'multiple-choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: 'Addition of 2 and 2 equals 4.',
          points: 1,
          difficulty: 'Beginner'
        },
        {
          questionText: 'Solve for x: 2x = 8',
          questionType: 'multiple-choice',
          options: ['2', '4', '6', '8'],
          correctAnswer: '4',
          explanation: 'Dividing both sides by 2 gives x = 4.',
          points: 1,
          difficulty: 'Beginner'
        }
      ],
      status: 'published'
    });
    await testPracticeSet.save();

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

  describe('createPracticeSet', () => {
    test('should create a new practice set successfully', async () => {
      const { req, res } = mockRequestResponse();
      
      req.body = {
        title: 'New Test Practice Set',
        description: 'This is a new test practice set.',
        category: 'Algebra',
        topic: 'Quadratic Equations',
        difficulty: 'Intermediate',
        lesson: testLesson._id,
        questions: [
          {
            questionText: 'What is 3 + 3?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '6',
            explanation: 'Addition of 3 and 3 equals 6.',
            points: 1,
            difficulty: 'Beginner'
          }
        ]
      };

      await practiceSetController.createPracticeSet(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: {
            practiceSet: expect.objectContaining({
              title: 'New Test Practice Set',
              description: 'This is a new test practice set.',
              category: 'Algebra',
              topic: 'Quadratic Equations',
              difficulty: 'Intermediate',
              author: testUser._id,
              lesson: testLesson._id,
              questions: expect.arrayContaining([
                expect.objectContaining({
                  questionText: 'What is 3 + 3?',
                  correctAnswer: '6'
                })
              ])
            })
          }
        })
      );

      // Verify practice set was created in the database
      const practiceSet = await PracticeSet.findOne({ title: 'New Test Practice Set' });
      expect(practiceSet).toBeTruthy();
      expect(practiceSet.author.toString()).toBe(testUser._id.toString());
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

      await practiceSetController.createPracticeSet(req, res);

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
        title: 'Error Test Practice Set',
        description: 'This should trigger an error.',
        topic: 'Error Testing',
        category: 'Algebra',
        difficulty: 'Beginner'
        // Missing problems to trigger error
      };

      // Mock the PracticeSet.save method to throw an error
      jest.spyOn(mongoose.Model.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await practiceSetController.createPracticeSet(req, res);

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

  describe('getPracticeSets', () => {
    beforeEach(async () => {
      // Create additional test practice sets with different attributes
      await new PracticeSet({
        title: 'Algebra Basics',
        description: 'Practice the basics of algebra in this comprehensive set.',
        category: 'Algebra',
        topic: 'Basic Algebra',
        difficulty: 'Beginner',
        author: testUser._id,
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
        title: 'Advanced Calculus',
        description: 'Practice advanced calculus concepts and techniques.',
        category: 'Calculus',
        topic: 'Derivatives',
        difficulty: 'Advanced',
        author: testAdmin._id,
        problems: [
          {
            question: 'Find the derivative of f(x) = x²',
            options: ['f\'(x) = x', 'f\'(x) = 2x', 'f\'(x) = 2', 'f\'(x) = x²'],
            correctAnswer: 'f\'(x) = 2x',
            explanation: 'The derivative of x² is 2x.'
          }
        ],
        status: 'published'
      }).save();

      await new PracticeSet({
        title: 'Draft Practice Set',
        description: 'This is a draft practice set that should not be returned in public queries.',
        category: 'Geometry',
        topic: 'Circles',
        difficulty: 'Intermediate',
        author: testUser._id,
        problems: [
          {
            question: 'What is the formula for the area of a circle?',
            options: ['A = πr', 'A = πr²', 'A = 2πr', 'A = πd'],
            correctAnswer: 'A = πr²',
            explanation: 'The area of a circle is pi times the radius squared.'
          }
        ],
        status: 'draft'
      }).save();
    });

    test('should get all published practice sets with default pagination', async () => {
      const { req, res } = mockRequestResponse();
      
      await practiceSetController.getPracticeSets(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData).toHaveProperty('status', 'success');
      expect(responseData).toHaveProperty('data');
      expect(responseData.data).toHaveProperty('practiceSets');
      expect(responseData.data).toHaveProperty('currentPage', 1);
      expect(responseData.data).toHaveProperty('totalPages');
      expect(responseData.data).toHaveProperty('totalPracticeSets');
      
      // Only published practice sets should be returned (3 out of 4)
      expect(responseData.data.practiceSets.length).toBe(3);
      
      // Check that draft practice sets are not included
      const draftPracticeSetIncluded = responseData.data.practiceSets.some(set => set.title === 'Draft Practice Set');
      expect(draftPracticeSetIncluded).toBe(false);
    });

    test('should filter practice sets by category', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { category: 'Algebra' };
      
      await practiceSetController.getPracticeSets(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData).toHaveProperty('status', 'success');
      expect(responseData).toHaveProperty('data');
      expect(responseData.data.practiceSets.every(set => set.category === 'Algebra')).toBe(true);
      expect(responseData.data.practiceSets.length).toBe(2); // Two Algebra practice sets
    });

    test('should filter practice sets by difficulty', async () => {
      const { req, res } = mockRequestResponse();
      req.query = { difficulty: 'Advanced' };
      
      await practiceSetController.getPracticeSets(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      
      expect(responseData).toHaveProperty('status', 'success');
      expect(responseData).toHaveProperty('data');
      expect(responseData.data.practiceSets.every(set => set.difficulty === 'Advanced')).toBe(true);
      expect(responseData.data.practiceSets.length).toBe(1); // One Advanced practice set
    });

    test('should handle server errors', async () => {
      const { req, res } = mockRequestResponse();
      
      // Mock PracticeSet.find to throw an error
      jest.spyOn(PracticeSet, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await practiceSetController.getPracticeSets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );

      // Restore the original implementation
      PracticeSet.find.mockRestore();
    });
  });

  describe('getPracticeSet', () => {
    test('should get a specific practice set by ID', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: testPracticeSet._id.toString() };
      
      // Properly mock the populate call to return populated practice set
      const populateMock = jest.fn().mockResolvedValueOnce({
        _id: testPracticeSet._id,
        title: 'Test Practice Set',
        description: 'This is a test practice set with enough description for testing purposes.',
        category: 'Algebra',
        topic: 'Linear Equations',
        difficulty: 'Beginner',
        author: testUser._id,
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
      
      jest.spyOn(PracticeSet, 'findById').mockReturnValue({
        populate: populateMock
      });
      
      await practiceSetController.getPracticeSet(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: {
            practiceSet: expect.objectContaining({
              _id: expect.any(Object),
              title: 'Test Practice Set',
              description: 'This is a test practice set with enough description for testing purposes.',
              category: 'Algebra',
              topic: 'Linear Equations',
              difficulty: 'Beginner'
            })
          }
        })
      );
      
      // Restore the original implementation
      PracticeSet.findById.mockRestore();
    });

    test('should return 404 for non-existent practice set ID', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      
      // Mock findById().populate() to return null (practice set not found)
      jest.spyOn(PracticeSet, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValueOnce(null)
      });
      
      await practiceSetController.getPracticeSet(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Practice set not found'
        })
      );
      
      // Restore the original implementation
      PracticeSet.findById.mockRestore();
    });

    test('should handle server errors for invalid ID format', async () => {
      const { req, res } = mockRequestResponse();
      req.params = { id: 'invalid-id' };
      
      await practiceSetController.getPracticeSet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );
    });
  });

  // Additional tests will be added for updatePracticeSet, deletePracticeSet, 
  // and other methods as we implement them
}); 