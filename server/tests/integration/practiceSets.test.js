const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const PracticeSet = require('../../models/PracticeSet');
const { createTestUser, createTestAdmin, generateTestToken } = require('../utils/testUtils');
const { errorHandler } = require('../../middleware/errorHandler');

// Mock the rate limiter middleware
jest.mock('../../middleware/rateLimiter', () => ({
  authLimiter: (req, res, next) => next(),
  adminLimiter: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
  solverLimiter: (req, res, next) => next()
}));

// Now we can safely import the routes that use the mocked rateLimiter
const practiceSetRoutes = require('../../routes/practiceSets');

// Setup the Express app for testing
const app = express();
app.use(express.json());
app.use('/api/practice-sets', practiceSetRoutes);
app.use(errorHandler);

describe('Practice Set Routes Integration Tests', () => {
  let testUser;
  let testAdmin;
  let userToken;
  let adminToken;
  let testPracticeSet;
  
  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Create users for testing
    testUser = await createTestUser();
    testAdmin = await createTestAdmin();
    
    // Generate tokens
    userToken = generateTestToken(testUser._id, 'user');
    adminToken = generateTestToken(testAdmin._id, 'admin');
    
    // Create a test practice set
    testPracticeSet = new PracticeSet({
      title: 'Integration Test Practice Set',
      description: 'This is a practice set created for integration testing.',
      category: 'Algebra',
      topic: 'Linear Equations',
      difficulty: 'Beginner',
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

    // Create additional test practice sets with different attributes
    await new PracticeSet({
      title: 'Second Practice Set',
      description: 'Description for the second practice set.',
      category: 'Geometry',
      topic: 'Triangles',
      difficulty: 'Intermediate',
      author: testAdmin._id,
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

    await new PracticeSet({
      title: 'Draft Practice Set',
      description: 'This is a draft practice set that should not be visible to regular users.',
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
      status: 'draft'
    }).save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/practice-sets', () => {
    test('should get all published practice sets with default pagination', async () => {
      const response = await request(app)
        .get('/api/practice-sets')
        .expect(200);
      
      expect(response.body).toHaveProperty('practiceSets');
      expect(response.body).toHaveProperty('totalPracticeSets');
      expect(response.body).toHaveProperty('currentPage');
      expect(response.body).toHaveProperty('totalPages');
      
      // Should only return published practice sets (2 out of 3)
      expect(response.body.practiceSets.length).toBe(2);
      expect(response.body.practiceSets.every(set => set.status === 'published')).toBe(true);
    });

    test('should filter practice sets by category', async () => {
      const response = await request(app)
        .get('/api/practice-sets?category=Algebra')
        .expect(200);
      
      expect(response.body.practiceSets.every(set => set.category === 'Algebra')).toBe(true);
      expect(response.body.practiceSets.length).toBe(1);
    });

    test('should filter practice sets by difficulty', async () => {
      const response = await request(app)
        .get('/api/practice-sets?difficulty=Intermediate')
        .expect(200);
      
      expect(response.body.practiceSets.every(set => set.difficulty === 'Intermediate')).toBe(true);
      expect(response.body.practiceSets.length).toBe(1);
    });

    test('should apply custom sorting', async () => {
      const response = await request(app)
        .get('/api/practice-sets?sortBy=title&sortOrder=asc')
        .expect(200);
      
      // Check practice sets are sorted by title
      const titles = response.body.practiceSets.map(set => set.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);
    });

    test('should apply pagination correctly', async () => {
      const response = await request(app)
        .get('/api/practice-sets?page=1&limit=1')
        .expect(200);
      
      expect(response.body.practiceSets.length).toBe(1);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(2); // 2 published practice sets with limit 1
    });

    test('should handle search parameter', async () => {
      const response = await request(app)
        .get('/api/practice-sets?search=integration')
        .expect(200);
      
      expect(response.body.practiceSets.length).toBeGreaterThan(0);
      // Verify search found the relevant practice set
      expect(response.body.practiceSets.some(set => 
        set.title.includes('Integration') || 
        set.description.includes('integration')
      )).toBe(true);
    });

    test('should handle invalid query parameters gracefully', async () => {
      // Invalid page number
      const response = await request(app)
        .get('/api/practice-sets?page=invalid')
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('valid');
    });
  });

  describe('GET /api/practice-sets/:id', () => {
    test('should get a practice set by ID', async () => {
      const response = await request(app)
        .get(`/api/practice-sets/${testPracticeSet._id}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', testPracticeSet._id.toString());
      expect(response.body).toHaveProperty('title', 'Integration Test Practice Set');
      expect(response.body).toHaveProperty('description', 'This is a practice set created for integration testing.');
      expect(response.body).toHaveProperty('category', 'Algebra');
      expect(response.body).toHaveProperty('topic', 'Linear Equations');
      expect(response.body).toHaveProperty('author');
      expect(response.body).toHaveProperty('problems');
      expect(response.body.problems.length).toBe(2);
    });

    test('should return 404 for non-existent practice set ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/practice-sets/${nonExistentId}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Practice set not found');
    });

    test('should return 400 for invalid practice set ID format', async () => {
      const response = await request(app)
        .get('/api/practice-sets/invalid-id')
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('POST /api/practice-sets', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/practice-sets')
        .send({
          title: 'New Practice Set',
          description: 'Description for the new practice set.',
          category: 'Algebra',
          topic: 'Equations',
          difficulty: 'Beginner',
          problems: [
            {
              question: 'What is 3 + 3?',
              options: ['5', '6', '7', '8'],
              correctAnswer: '6',
              explanation: 'Addition of 3 and 3 equals 6.'
            }
          ]
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied. No authentication token provided.');
    });

    test('should create a new practice set when authenticated', async () => {
      const practiceSetData = {
        title: 'User Created Practice Set',
        description: 'This practice set was created by a user through the API.',
        category: 'Algebra',
        topic: 'Quadratic Equations',
        difficulty: 'Intermediate',
        problems: [
          {
            question: 'What is 5 + 5?',
            options: ['8', '9', '10', '11'],
            correctAnswer: '10',
            explanation: 'Addition of 5 and 5 equals 10.'
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/practice-sets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(practiceSetData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', practiceSetData.title);
      expect(response.body).toHaveProperty('description', practiceSetData.description);
      expect(response.body).toHaveProperty('category', practiceSetData.category);
      expect(response.body).toHaveProperty('topic', practiceSetData.topic);
      expect(response.body).toHaveProperty('author', testUser._id.toString());
      
      // Verify practice set was created in database
      const savedPracticeSet = await PracticeSet.findById(response.body._id);
      expect(savedPracticeSet).toBeTruthy();
      expect(savedPracticeSet.title).toBe(practiceSetData.title);
    });

    test('should validate input on creation', async () => {
      const invalidData = {
        // Missing required fields
        title: 'A',  // Too short
        difficulty: 'InvalidLevel' // Invalid enum value
      };
      
      const response = await request(app)
        .post('/api/practice-sets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      // or expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/practice-sets/:id', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/practice-sets/${testPracticeSet._id}`)
        .send({ title: 'Updated Title' })
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied. No authentication token provided.');
    });

    test('should update a practice set when authenticated as author', async () => {
      // Create a practice set by the test user
      const userPracticeSet = await new PracticeSet({
        title: 'User Practice Set',
        description: 'This practice set was created by the test user.',
        category: 'Algebra',
        topic: 'Basic Equations',
        difficulty: 'Beginner',
        author: testUser._id,
        problems: [
          {
            question: 'What is 1 + 1?',
            options: ['1', '2', '3', '4'],
            correctAnswer: '2',
            explanation: 'Addition of 1 and 1 equals 2.'
          }
        ],
        status: 'published'
      }).save();
      
      const updateData = {
        title: 'Updated User Practice Set',
        description: 'The description has been updated.',
        difficulty: 'Intermediate'
      };
      
      const response = await request(app)
        .put(`/api/practice-sets/${userPracticeSet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', updateData.description);
      expect(response.body).toHaveProperty('difficulty', updateData.difficulty);
      
      // Verify practice set was updated in database
      const updatedPracticeSet = await PracticeSet.findById(userPracticeSet._id);
      expect(updatedPracticeSet.title).toBe(updateData.title);
      expect(updatedPracticeSet.difficulty).toBe(updateData.difficulty);
    });

    test('should validate input on update', async () => {
      // Create a practice set by the test user
      const userPracticeSet = await new PracticeSet({
        title: 'User Practice Set for Validation',
        description: 'This practice set will be used for validation testing.',
        category: 'Algebra',
        topic: 'Validation Testing',
        difficulty: 'Beginner',
        author: testUser._id,
        problems: [
          {
            question: 'What is 1 + 1?',
            options: ['1', '2', '3', '4'],
            correctAnswer: '2',
            explanation: 'Addition of 1 and 1 equals 2.'
          }
        ],
        status: 'published'
      }).save();
      
      const invalidData = {
        title: 'A',  // Too short
        category: 'InvalidCategory' // Invalid enum value
      };
      
      const response = await request(app)
        .put(`/api/practice-sets/${userPracticeSet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      // or expect(response.body).toHaveProperty('message');
    });

    test('should return 404 for non-existent practice set', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/practice-sets/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Update Non-existent Practice Set' })
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Practice set not found');
    });

    test('should return 403 when user is not the author', async () => {
      const response = await request(app)
        .put(`/api/practice-sets/${testPracticeSet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Unauthorized Update Attempt' })
        .expect(403);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Not authorized');
    });
  });

  describe('DELETE /api/practice-sets/:id', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/practice-sets/${testPracticeSet._id}`)
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied. No authentication token provided.');
    });

    test('should archive a practice set when authenticated as author', async () => {
      // Create a practice set by the test user
      const userPracticeSet = await new PracticeSet({
        title: 'User Practice Set to Delete',
        description: 'This practice set will be deleted/archived.',
        category: 'Algebra',
        topic: 'Archiving Tests',
        difficulty: 'Beginner',
        author: testUser._id,
        problems: [
          {
            question: 'What is 1 + 1?',
            options: ['1', '2', '3', '4'],
            correctAnswer: '2',
            explanation: 'Addition of 1 and 1 equals 2.'
          }
        ],
        status: 'published'
      }).save();
      
      const response = await request(app)
        .delete(`/api/practice-sets/${userPracticeSet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Practice set archived successfully');
      
      // Verify practice set was archived in database
      const archivedPracticeSet = await PracticeSet.findById(userPracticeSet._id);
      expect(archivedPracticeSet).toBeTruthy(); // Not actually deleted
      expect(archivedPracticeSet.status).toBe('archived');
    });

    test('should return 404 for non-existent practice set', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/practice-sets/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Practice set not found');
    });

    test('should return 403 when user is not the author', async () => {
      const response = await request(app)
        .delete(`/api/practice-sets/${testPracticeSet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Not authorized');
    });
  });
});
