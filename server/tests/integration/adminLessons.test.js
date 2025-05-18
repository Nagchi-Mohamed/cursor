const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Lesson = require('../../models/Lesson');
const { createTestUser, createTestAdmin, generateTestToken } = require('../utils/testUtils');
const { errorHandler } = require('../../middleware/errorHandler');

// Mock the rate limiter middleware
jest.mock('../../middleware/rateLimiter', () => ({
  authLimiter: (req, res, next) => next(),
  adminLimiter: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
  solverLimiter: (req, res, next) => next()
}));

// Mock the protect middleware to bypass authentication in tests
jest.mock('../../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'testuserid', role: 'admin' };
    next();
  },
  isAdmin: (req, res, next) => next(),
  isEditorOrAdmin: (req, res, next) => next(),
  optionalAuth: (req, res, next) => next()
}));

// Mock multer middleware
jest.mock('multer', () => {
  const multerMock = () => ({
    single: () => (req, res, next) => {
      if (req.mockFileError) {
        return next(req.mockFileError);
      }
      
      if (req.shouldHaveFile) {
        req.file = {
          filename: 'test-image-123456.jpg',
          path: 'uploads/lessons/test-image-123456.jpg'
        };
      }
      
      next();
    }
  });
  
  multerMock.diskStorage = () => ({});
  return multerMock;
});

// Mock fs.promises.mkdir to avoid actual directory creation
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined)
  }
}));

// Import admin lesson routes
const adminLessonRoutes = require('../../routes/adminLessonRoutes');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/admin', adminLessonRoutes);
app.use(errorHandler);

describe('Admin Lesson Routes Integration Tests', () => {
  let testUser;
  let testAdmin;
  let userToken;
  let adminToken;
  let testLesson;
  
  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Create users
    testUser = await createTestUser();
    testAdmin = await createTestAdmin();
    
    // Generate tokens
    userToken = generateTestToken(testUser._id, 'user');
    adminToken = generateTestToken(testAdmin._id, 'admin');
    
    // Create a test lesson
    testLesson = new Lesson({
      title: 'Admin Integration Test Lesson',
      description: 'This is a lesson created for admin integration testing.',
      category: 'Algebra',
      topic: 'Linear Equations',
      difficulty: 'Beginner',
      author: testAdmin._id,
      content: 'Lesson content goes here.',
      estimatedDuration: 30,
      status: 'published'
    });
    await testLesson.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/admin/lessons', () => {
    test('should get all lessons including drafts for admin', async () => {
      const response = await request(app)
        .get('/api/admin/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.lessons.length).toBeGreaterThanOrEqual(1);
      expect(response.body.lessons.some(lesson => lesson.status === 'draft')).toBe(true);
    });

    test('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/admin/lessons')
        .expect(401);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .get('/api/admin/lessons')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/admin/lessons/:id', () => {
    test('should get a lesson by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/admin/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body._id).toBe(testLesson._id.toString());
      expect(response.body.title).toBe(testLesson.title);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/admin/lessons/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /api/admin/lessons', () => {
    test('should create a new lesson for admin', async () => {
      const newLesson = {
        title: 'New Admin Lesson',
        description: 'Created by admin',
        category: 'Geometry',
        topic: 'Triangles',
        difficulty: 'Intermediate',
        content: 'Lesson content here',
        estimatedDuration: 45,
        status: 'draft'
      };

      const response = await request(app)
        .post('/api/admin/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newLesson)
        .expect(201);
      
      expect(response.body.title).toBe(newLesson.title);
      expect(response.body.status).toBe('draft');
    });

    test('should return 400 for invalid input', async () => {
      const invalidData = {
        title: 'A',
        category: 'InvalidCategory'
      };

      await request(app)
        .post('/api/admin/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .post('/api/admin/lessons')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('PUT /api/admin/lessons/:id', () => {
    test('should update a lesson for admin', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'published'
      };

      const response = await request(app)
        .put(`/api/admin/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/admin/lessons/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test' })
        .expect(404);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .put(`/api/admin/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test' })
        .expect(403);
    });
  });

  describe('DELETE /api/admin/lessons/:id', () => {
    test('should archive a lesson for admin', async () => {
      const response = await request(app)
        .delete(`/api/admin/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.message).toBe('Lesson archived successfully');
      
      const archivedLesson = await Lesson.findById(testLesson._id);
      expect(archivedLesson.status).toBe('archived');
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/admin/lessons/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 403 if user is not admin', async () => {
      await request(app)
        .delete(`/api/admin/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
