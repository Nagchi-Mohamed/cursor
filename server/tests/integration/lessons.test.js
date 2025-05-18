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

// Now we can safely import the routes that use the mocked rateLimiter
const lessonRoutes = require('../../routes/lessons');

// Setup the Express app for testing
const app = express();
app.use(express.json());
app.use('/api/lessons', lessonRoutes);
app.use(errorHandler);

describe('Lesson Routes Integration Tests', () => {
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
    // Create users for testing
    testUser = await createTestUser();
    testAdmin = await createTestAdmin();
    
    // Generate tokens
    userToken = generateTestToken(testUser._id, 'user');
    adminToken = generateTestToken(testAdmin._id, 'admin');
    
    // Create a test lesson
    testLesson = new Lesson({
      title: 'Integration Test Lesson',
      content: 'This is a lesson created for integration testing.',
      category: 'Algebra',
      difficulty: 'Beginner',
      author: testAdmin._id,
      estimatedDuration: 60,
      status: 'published',
      tags: ['integration', 'test']
    });
    await testLesson.save();

    // Create additional test lessons with different attributes
    await new Lesson({
      title: 'Second Lesson',
      content: 'Content for the second lesson.',
      category: 'Geometry',
      difficulty: 'Intermediate',
      author: testAdmin._id,
      estimatedDuration: 45,
      status: 'published',
      tags: ['geometry', 'shapes']
    }).save();

    await new Lesson({
      title: 'Draft Lesson',
      content: 'This is a draft lesson that should not be visible to regular users.',
      category: 'Calculus',
      difficulty: 'Advanced',
      author: testAdmin._id,
      estimatedDuration: 90,
      status: 'draft',
      tags: ['calculus', 'draft']
    }).save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/lessons', () => {
    test('should get all published lessons with default pagination', async () => {
      const response = await request(app)
        .get('/api/lessons')
        .expect(200);
      
      expect(response.body).toHaveProperty('lessons');
      expect(response.body).toHaveProperty('totalLessons');
      expect(response.body).toHaveProperty('currentPage');
      expect(response.body).toHaveProperty('totalPages');
      
      // Should only return published lessons (2 out of 3)
      expect(response.body.lessons.length).toBe(2);
      expect(response.body.lessons.every(lesson => lesson.status === 'published')).toBe(true);
    });

    test('should filter lessons by category', async () => {
      const response = await request(app)
        .get('/api/lessons?category=Algebra')
        .expect(200);
      
      expect(response.body.lessons.every(lesson => lesson.category === 'Algebra')).toBe(true);
      expect(response.body.lessons.length).toBe(1);
    });

    test('should filter lessons by difficulty', async () => {
      const response = await request(app)
        .get('/api/lessons?difficulty=Intermediate')
        .expect(200);
      
      expect(response.body.lessons.every(lesson => lesson.difficulty === 'Intermediate')).toBe(true);
      expect(response.body.lessons.length).toBe(1);
    });

    test('should apply custom sorting', async () => {
      const response = await request(app)
        .get('/api/lessons?sortBy=title&sortOrder=asc')
        .expect(200);
      
      // Check lessons are sorted by title
      const titles = response.body.lessons.map(lesson => lesson.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);
    });

    test('should apply pagination correctly', async () => {
      const response = await request(app)
        .get('/api/lessons?page=1&limit=1')
        .expect(200);
      
      expect(response.body.lessons.length).toBe(1);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(2); // 2 published lessons with limit 1
    });

    test('should handle search parameter', async () => {
      const response = await request(app)
        .get('/api/lessons?search=integration')
        .expect(200);
      
      expect(response.body.lessons.length).toBeGreaterThan(0);
      // Verify search found the relevant lesson
      expect(response.body.lessons.some(lesson => 
        lesson.title.includes('Integration') || 
        lesson.content.includes('integration') ||
        lesson.tags.includes('integration')
      )).toBe(true);
    });

    test('should handle invalid query parameters gracefully', async () => {
      // Invalid page number
      const response = await request(app)
        .get('/api/lessons?page=invalid')
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('valid');
    });
  });

  describe('GET /api/lessons/:id', () => {
    test('should get a lesson by ID', async () => {
      const response = await request(app)
        .get(`/api/lessons/${testLesson._id}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id', testLesson._id.toString());
      expect(response.body).toHaveProperty('title', 'Integration Test Lesson');
      expect(response.body).toHaveProperty('content', 'This is a lesson created for integration testing.');
      expect(response.body).toHaveProperty('category', 'Algebra');
      expect(response.body).toHaveProperty('author');
    });

    test('should return 404 for non-existent lesson ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/lessons/${nonExistentId}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Lesson not found');
    });

    test('should return 400 for invalid lesson ID format', async () => {
      const response = await request(app)
        .get('/api/lessons/invalid-id')
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid lesson ID');
    });
  });

  describe('GET /api/lessons/category/:category', () => {
    test('should get lessons by category', async () => {
      const response = await request(app)
        .get('/api/lessons/category/Algebra')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(lesson => lesson.category === 'Algebra')).toBe(true);
    });

    test('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/lessons/category/NonExistentCategory')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/lessons/search', () => {
    test('should search lessons based on query', async () => {
      const response = await request(app)
        .get('/api/lessons/search?query=integration')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      // Verify search found the relevant lesson
      expect(response.body.some(lesson => 
        lesson.title.includes('Integration') || 
        lesson.content.includes('integration') ||
        lesson.tags.includes('integration')
      )).toBe(true);
    });

    test('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/lessons/search?query=nonexistentterm')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/lessons', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/lessons')
        .send({
          title: 'New Lesson',
          content: 'Content for the new lesson.',
          category: 'Algebra',
          difficulty: 'Beginner',
          estimatedDuration: 30
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authenticated');
    });

    test('should require admin privileges', async () => {
      const response = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Lesson',
          content: 'Content for the new lesson.',
          category: 'Algebra',
          difficulty: 'Beginner',
          estimatedDuration: 30
        })
        .expect(403);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Admin');
    });

    test('should create a new lesson when admin authenticated', async () => {
      const lessonData = {
        title: 'Admin Created Lesson',
        content: 'This lesson was created by an admin through the API.',
        category: 'Algebra',
        difficulty: 'Intermediate',
        estimatedDuration: 75,
        tags: ['api', 'created']
      };
      
      const response = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(lessonData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', lessonData.title);
      expect(response.body).toHaveProperty('content', lessonData.content);
      expect(response.body).toHaveProperty('category', lessonData.category);
      expect(response.body).toHaveProperty('author', testAdmin._id.toString());
      
      // Verify lesson was created in database
      const savedLesson = await Lesson.findById(response.body._id);
      expect(savedLesson).toBeTruthy();
      expect(savedLesson.title).toBe(lessonData.title);
    });

    test('should validate input on creation', async () => {
      const invalidData = {
        // Missing required fields
        title: 'A',  // Too short
        difficulty: 'InvalidLevel' // Invalid enum value
      };
      
      const response = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      // or expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/lessons/:id', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/lessons/${testLesson._id}`)
        .send({ title: 'Updated Title' })
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authenticated');
    });

    test('should require admin privileges', async () => {
      const response = await request(app)
        .put(`/api/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Admin');
    });

    test('should update a lesson when admin authenticated', async () => {
      const updateData = {
        title: 'Updated Integration Test Lesson',
        content: 'The content has been updated.',
        difficulty: 'Advanced'
      };
      
      const response = await request(app)
        .put(`/api/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('content', updateData.content);
      expect(response.body).toHaveProperty('difficulty', updateData.difficulty);
      
      // Verify lesson was updated in database
      const updatedLesson = await Lesson.findById(testLesson._id);
      expect(updatedLesson.title).toBe(updateData.title);
      expect(updatedLesson.difficulty).toBe(updateData.difficulty);
    });

    test('should validate input on update', async () => {
      const invalidData = {
        title: 'A',  // Too short
        category: 'InvalidCategory' // Invalid enum value
      };
      
      const response = await request(app)
        .put(`/api/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      // or expect(response.body).toHaveProperty('errors');
    });

    test('should return 404 for non-existent lesson', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/lessons/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Update Non-existent Lesson' })
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Lesson not found');
    });
  });

  describe('DELETE /api/lessons/:id', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/lessons/${testLesson._id}`)
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authenticated');
    });

    test('should require admin privileges', async () => {
      const response = await request(app)
        .delete(`/api/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Admin');
    });

    test('should archive a lesson when admin authenticated', async () => {
      const response = await request(app)
        .delete(`/api/lessons/${testLesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Lesson archived successfully');
      
      // Verify lesson was archived in database
      const archivedLesson = await Lesson.findById(testLesson._id);
      expect(archivedLesson).toBeTruthy(); // Not actually deleted
      expect(archivedLesson.status).toBe('archived');
    });

    test('should return 404 for non-existent lesson', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/lessons/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Lesson not found');
    });
  });
}); 