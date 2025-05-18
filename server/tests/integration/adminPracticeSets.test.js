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

// Import admin practice set routes
const adminPracticeSetRoutes = require('../../routes/adminPracticeSetRoutes');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/admin', adminPracticeSetRoutes);
app.use(errorHandler);

describe('Admin Practice Set Routes Integration Tests', () => {
  let testUser;
  let testAdmin;
  let editorUser;
  let userToken;
  let adminToken;
  let editorToken;
  let testPracticeSet;
  
  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Create users
    testUser = await createTestUser();
    testAdmin = await createTestAdmin();
    editorUser = await createTestUser({
      username: 'testeditor',
      email: 'editor@example.com',
      role: 'editor'
    });
    
    // Generate tokens
    userToken = generateTestToken(testUser._id, 'user');
    adminToken = generateTestToken(testAdmin._id, 'admin');
    editorToken = generateTestToken(editorUser._id, 'editor');
    
    // Create a test practice set
    testPracticeSet = new PracticeSet({
      title: 'Admin Integration Test Practice Set',
      description: 'This is a practice set created for admin integration testing.',
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
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/admin/practice-sets', () => {
    test('should get all practice sets including drafts for admin', async () => {
      const response = await request(app)
        .get('/api/admin/practice-sets')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.practiceSets.length).toBeGreaterThanOrEqual(1);
      expect(response.body.practiceSets.some(ps => ps.status === 'draft')).toBe(true);
    });

    test('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/admin/practice-sets')
        .expect(401);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .get('/api/admin/practice-sets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/admin/practice-sets/:id', () => {
    test('should get a practice set by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/admin/practice-sets/${testPracticeSet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body._id).toBe(testPracticeSet._id.toString());
      expect(response.body.title).toBe(testPracticeSet.title);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/admin/practice-sets/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /api/admin/practice-sets', () => {
    test('should create a new practice set for admin', async () => {
      const newPracticeSet = {
        title: 'New Admin Practice Set',
        description: 'Created by admin',
        category: 'Geometry',
        topic: 'Triangles',
        difficulty: 'Intermediate',
        problems: [
          {
            question: 'What is the sum of angles in a triangle?',
            options: ['180', '90', '360', '270'],
            correctAnswer: '180',
            explanation: 'Sum of angles in a triangle is 180 degrees.'
          }
        ],
        status: 'draft'
      };

      const response = await request(app)
        .post('/api/admin/practice-sets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPracticeSet)
        .expect(201);
      
      expect(response.body.title).toBe(newPracticeSet.title);
      expect(response.body.status).toBe('draft');
    });

    test('should return 400 for invalid input', async () => {
      const invalidData = {
        title: 'A',
        category: 'InvalidCategory'
      };

      await request(app)
        .post('/api/admin/practice-sets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .post('/api/admin/practice-sets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('PUT /api/admin/practice-sets/:id', () => {
    test('should update a practice set for admin', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'published'
      };

      const response = await request(app)
        .put(`/api/admin/practice-sets/${testPracticeSet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/admin/practice-sets/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test' })
        .expect(404);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .put(`/api/admin/practice-sets/${testPracticeSet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test' })
        .expect(403);
    });
  });

  describe('DELETE /api/admin/practice-sets/:id', () => {
    test('should archive a practice set for admin', async () => {
      const response = await request(app)
        .delete(`/api/admin/practice-sets/${testPracticeSet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.message).toBe('Practice set archived successfully');
      
      const archivedSet = await PracticeSet.findById(testPracticeSet._id);
      expect(archivedSet.status).toBe('archived');
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/admin/practice-sets/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .delete(`/api/admin/practice-sets/${testPracticeSet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
