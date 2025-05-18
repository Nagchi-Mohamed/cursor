const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const User = require('../../models/User');
const { createTestUser, createTestAdmin, generateTestToken } = require('../utils/testUtils');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('../../middleware/errorHandler');

// Mock the rate limiter middleware
jest.mock('../../middleware/rateLimiter', () => ({
  authLimiter: (req, res, next) => next(),
  adminLimiter: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next()
}));

// Mock the validators to avoid validation errors
jest.mock('../../middleware/validators/adminUserValidators', () => ({
  validateListUsersQuery: (req, res, next) => next(),
  validateUserIdParam: (req, res, next) => next(),
  validateUpdateUserByAdmin: (req, res, next) => next()
}));

// Import routes
const adminUserRoutes = require('../../routes/adminUserRoutes');

// Set up the Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/admin/users', adminUserRoutes);
app.use(errorHandler);

describe('Admin User Routes Integration Tests', () => {
  beforeAll(async () => {
    await global.connectToDatabase();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Helper function to create authenticated request
  const createAuthenticatedRequest = (admin) => {
    const token = generateTestToken(admin._id, admin.role);
    return request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${token}`);
  };

  describe('GET /api/v1/admin/users', () => {
    test('should return paginated list of users to authenticated admin', async () => {
      // Create admin user and regular users
      const admin = await createTestAdmin();
      const users = [];
      for (let i = 0; i < 5; i++) {
        users.push(await createTestUser({
          username: `testuser${i}`,
          email: `test${i}@example.com`
        }));
      }

      // Create authenticated request
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.totalUsers).toBe(6); // 5 regular users + 1 admin
      expect(response.body.data.users).toHaveLength(6);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        limit: 10
      });
    });

    test('should filter users by keyword search parameter', async () => {
      // Create admin and users with specific usernames
      const admin = await createTestAdmin();
      await createTestUser({ username: 'alpha', email: 'alpha@example.com' });
      await createTestUser({ username: 'beta', email: 'beta@example.com' });
      await createTestUser({ username: 'alphagamma', email: 'ag@example.com' });

      // Search for users with 'alpha' in username or email
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .get('/api/v1/admin/users?keyword=alpha')
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(2); // Should match 'alpha' and 'alphagamma'
      expect(response.body.data.users.some(u => u.username === 'alpha')).toBeTruthy();
      expect(response.body.data.users.some(u => u.username === 'alphagamma')).toBeTruthy();
      expect(response.body.data.users.some(u => u.username === 'beta')).toBeFalsy();
    });

    test('should filter users by role parameter', async () => {
      // Create admin and users with different roles
      const admin = await createTestAdmin();
      await createTestUser({ role: 'user' });
      await createTestUser({ role: 'editor' });
      await createTestUser({ role: 'user' });

      // Search for users with editor role
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .get('/api/v1/admin/users?role=editor')
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(1); // Should match the one editor
      expect(response.body.data.users[0].role).toBe('editor');
    });

    test('should filter users by banned status parameter', async () => {
      // Create admin and users with different banned status
      const admin = await createTestAdmin();
      await createTestUser({ isBanned: false });
      await createTestUser({ isBanned: true });
      await createTestUser({ isBanned: false });

      // Search for banned users
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .get('/api/v1/admin/users?isBanned=true')
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(1); // Should match the one banned user
      expect(response.body.data.users[0].isBanned).toBe(true);
    });

    test('should paginate results correctly', async () => {
      // Create admin and many users
      const admin = await createTestAdmin();
      for (let i = 0; i < 15; i++) {
        await createTestUser({
          username: `testuser${i}`,
          email: `test${i}@example.com`
        });
      }

      // Get page 2 with limit 5
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .get('/api/v1/admin/users?page=2&limit=5')
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.pagination).toMatchObject({
        currentPage: 2,
        limit: 5,
        hasPrevPage: true
      });
      expect(response.body.data.users).toHaveLength(5);
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    test('should return 403 when authenticated as non-admin', async () => {
      // Create a regular user
      const user = await createTestUser();
      
      // Try to access admin endpoints with regular user token
      const token = generateTestToken(user._id, user.role);
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Admin privileges required');
    });
  });

  describe('GET /api/v1/admin/users/:userId', () => {
    test('should return a specific user by ID', async () => {
      // Create admin and a user
      const admin = await createTestAdmin();
      const user = await createTestUser();
      
      // Get specific user
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .get(`/api/v1/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user._id).toBe(user._id.toString());
      expect(response.body.data.user.username).toBe(user.username);
      expect(response.body.data.user.email).toBe(user.email);
    });

    test('should return 404 for non-existent user ID', async () => {
      // Create admin user
      const admin = await createTestAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Try to get non-existent user
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .get(`/api/v1/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('User not found');
    });

    test('should return 401 when not authenticated', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .get(`/api/v1/admin/users/${user._id}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    test('should return 403 when authenticated as non-admin', async () => {
      // Create two regular users
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      
      // Try to access admin endpoints with regular user token
      const token = generateTestToken(user1._id, user1.role);
      const response = await request(app)
        .get(`/api/v1/admin/users/${user2._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('PUT /api/v1/admin/users/:userId', () => {
    test('should update a user\'s role successfully', async () => {
      // Create admin and a user
      const admin = await createTestAdmin();
      const user = await createTestUser({ role: 'user' });

      // Update user role
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .put(`/api/v1/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'editor' });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.role).toBe('editor');

      // Verify database update
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.role).toBe('editor');
    });

    test('should update a user\'s banned status successfully', async () => {
      // Create admin and a user
      const admin = await createTestAdmin();
      const user = await createTestUser({ isBanned: false });

      // Ban the user
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .put(`/api/v1/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isBanned: true });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.data.user.isBanned).toBe(true);

      // Verify database update
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isBanned).toBe(true);
    });

    test('should prevent admin from changing their own role', async () => {
      // Create an admin user
      const admin = await createTestAdmin();

      // Try to change own role
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .put(`/api/v1/admin/users/${admin._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'user' });

      // Assertions
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Admin cannot change their own admin status');

      // Verify database was not updated
      const unchangedAdmin = await User.findById(admin._id);
      expect(unchangedAdmin.role).toBe('admin');
    });

    test('should return 404 for non-existent user ID', async () => {
      // Create admin user
      const admin = await createTestAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Try to update non-existent user
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .put(`/api/v1/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'editor' });

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('User not found');
    });

    test('should return 401 when not authenticated', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .put(`/api/v1/admin/users/${user._id}`)
        .send({ role: 'editor' });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('DELETE /api/v1/admin/users/:userId', () => {
    test('should soft delete a user by setting isActive to false', async () => {
      // Create admin and a user
      const admin = await createTestAdmin();
      const user = await createTestUser({ isActive: true });

      // Delete (deactivate) the user
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .delete(`/api/v1/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('User has been deactivated successfully');

      // Verify database update (soft delete)
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isActive).toBe(false);
    });

    test('should prevent admin from deleting themselves', async () => {
      // Create an admin user
      const admin = await createTestAdmin();

      // Try to delete self
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .delete(`/api/v1/admin/users/${admin._id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Admin cannot delete their own account');

      // Verify database was not updated
      const unchangedAdmin = await User.findById(admin._id);
      expect(unchangedAdmin.isActive).toBe(true);
    });

    test('should return 404 for non-existent user ID', async () => {
      // Create admin user
      const admin = await createTestAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Try to delete non-existent user
      const token = generateTestToken(admin._id, admin.role);
      const response = await request(app)
        .delete(`/api/v1/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('User not found');
    });

    test('should return 401 when not authenticated', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .delete(`/api/v1/admin/users/${user._id}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    test('should return 403 when authenticated as non-admin', async () => {
      // Create two regular users
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      
      // Try to access admin endpoints with regular user token
      const token = generateTestToken(user1._id, user1.role);
      const response = await request(app)
        .delete(`/api/v1/admin/users/${user2._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
    });
  });
}); 