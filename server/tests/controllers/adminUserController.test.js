const mongoose = require('mongoose');
const User = require('../../models/User');
const adminUserController = require('../../controllers/adminUserController');
const { ApiError } = require('../../middleware/errorHandler');
const { createTestUser, createTestAdmin } = require('../utils/testUtils');

describe('Admin User Controller Tests', () => {
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

  // Mock Express request and response objects
  const mockRequestResponse = () => {
    const req = {
      body: {},
      query: {},
      params: {},
      user: null
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();
    
    return { req, res, next };
  };

  describe('listUsers', () => {
    test('should return paginated list of users with default parameters', async () => {
      // Create several users
      const users = [];
      for (let i = 0; i < 15; i++) {
        users.push(await createTestUser({
          username: `user${i}`,
          email: `user${i}@example.com`
        }));
      }

      const { req, res, next } = mockRequestResponse();
      req.query = {}; // Using default values

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          results: expect.any(Number),
          totalUsers: 15,
          pagination: expect.objectContaining({
            currentPage: 1,
            totalPages: 2,
            limit: 10,
            hasNextPage: true,
            hasPrevPage: false
          }),
          data: expect.objectContaining({
            users: expect.any(Array)
          })
        })
      );

      // Check returned users count (should be limited by 10)
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.users.length).toBe(10);
    });

    test('should correctly apply pagination parameters', async () => {
      // Create several users
      const users = [];
      for (let i = 0; i < 15; i++) {
        users.push(await createTestUser({
          username: `user${i}`,
          email: `user${i}@example.com`
        }));
      }

      const { req, res, next } = mockRequestResponse();
      req.query = {
        page: 2,
        limit: 5
      };

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.pagination).toEqual(
        expect.objectContaining({
          currentPage: 2,
          totalPages: 3,
          limit: 5,
          hasNextPage: true,
          hasPrevPage: true
        })
      );
      expect(responseData.data.users.length).toBe(5);
    });

    test('should filter users by keyword search', async () => {
      // Create users with distinct usernames
      await createTestUser({ username: 'alpha', email: 'alpha@example.com' });
      await createTestUser({ username: 'beta', email: 'beta@example.com' });
      await createTestUser({ username: 'gamma', email: 'gamma@example.com' });
      await createTestUser({ username: 'alphabeta', email: 'alphabeta@example.com' });

      const { req, res, next } = mockRequestResponse();
      req.query = {
        keyword: 'alpha'
      };

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.totalUsers).toBe(2); // Should match 'alpha' and 'alphabeta'
      
      // Verify each returned user contains 'alpha' in username or email
      responseData.data.users.forEach(user => {
        expect(
          user.username.includes('alpha') || 
          user.email.includes('alpha')
        ).toBeTruthy();
      });
    });

    test('should filter users by role', async () => {
      // Create users with different roles
      await createTestUser({ role: 'user' }); // Default is 'user'
      await createTestUser({ role: 'user' });
      await createTestUser({ role: 'editor' });
      await createTestAdmin(); // Creates an admin user

      const { req, res, next } = mockRequestResponse();
      req.query = {
        role: 'admin'
      };

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.totalUsers).toBe(1); // Should find 1 admin
      expect(responseData.data.users[0].role).toBe('admin');
    });

    test('should filter users by banned status', async () => {
      // Create users with different banned status
      await createTestUser({ isBanned: false }); // Default is false
      await createTestUser({ isBanned: false });
      await createTestUser({ isBanned: true });

      const { req, res, next } = mockRequestResponse();
      req.query = {
        isBanned: true
      };

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.totalUsers).toBe(1); // Should find 1 banned user
      expect(responseData.data.users[0].isBanned).toBe(true);
    });

    test('should filter users by active status', async () => {
      // Create users with different active status
      await createTestUser({ isActive: true }); // Default is true
      await createTestUser({ isActive: true }); 
      await createTestUser({ isActive: false });

      const { req, res, next } = mockRequestResponse();
      req.query = {
        isActive: false
      };

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.totalUsers).toBe(1); // Should find 1 inactive user
      expect(responseData.data.users[0].isActive).toBe(false);
    });

    test('should sort users by specified field and order', async () => {
      // Create users with different creation times
      const userA = await createTestUser({ username: 'userA' });
      // Delay to ensure different creation timestamps
      await new Promise(resolve => setTimeout(resolve, 50));
      const userB = await createTestUser({ username: 'userB' });
      
      const { req, res, next } = mockRequestResponse();
      req.query = {
        sortBy: 'username',
        sortOrder: 'asc'
      };

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      
      // First user should be userA with ascending sort by username
      expect(responseData.data.users[0].username).toBe('usera'); // lowercase due to model transformation
    });

    test('should handle empty result set', async () => {
      // No users created, should be empty response
      const { req, res, next } = mockRequestResponse();
      req.query = {
        keyword: 'nonexistentuser'
      };

      await adminUserController.listUsers(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.results).toBe(0);
      expect(responseData.totalUsers).toBe(0);
      expect(responseData.data.users).toEqual([]);
    });
  });

  describe('getUserById', () => {
    test('should return a user by ID', async () => {
      // Create a test user
      const user = await createTestUser();

      const { req, res, next } = mockRequestResponse();
      req.params = { userId: user._id.toString() };

      await adminUserController.getUserById(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              _id: expect.any(Object),
              username: user.username,
              email: user.email
            })
          })
        })
      );
    });

    test('should return 404 if user not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: nonExistentId.toString() };

      await adminUserController.getUserById(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toContain('User not found');
    });
  });

  describe('updateUserByAdmin', () => {
    test('should update user role successfully', async () => {
      // Create a test user
      const user = await createTestUser();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: user._id.toString() };
      req.body = { role: 'editor' };
      req.user = { _id: new mongoose.Types.ObjectId() }; // Admin is not the same user

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              _id: expect.any(Object),
              username: user.username,
              email: user.email,
              role: 'editor'
            })
          })
        })
      );

      // Verify database was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.role).toBe('editor');
    });

    test('should update banned status successfully', async () => {
      // Create a test user
      const user = await createTestUser({ isBanned: false });
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: user._id.toString() };
      req.body = { isBanned: true };
      req.user = { _id: new mongoose.Types.ObjectId() }; // Admin is not the same user

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify database was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isBanned).toBe(true);
    });

    test('should update active status successfully', async () => {
      // Create a test user
      const user = await createTestUser({ isActive: true });
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: user._id.toString() };
      req.body = { isActive: false };
      req.user = { _id: new mongoose.Types.ObjectId() }; // Admin is not the same user

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify database was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isActive).toBe(false);
    });

    test('should update multiple fields at once', async () => {
      // Create a test user
      const user = await createTestUser({
        role: 'user',
        isBanned: false,
        isActive: true
      });
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: user._id.toString() };
      req.body = {
        role: 'editor',
        isBanned: true,
        isActive: false
      };
      req.user = { _id: new mongoose.Types.ObjectId() }; // Admin is not the same user

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify database was updated with all fields
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.role).toBe('editor');
      expect(updatedUser.isBanned).toBe(true);
      expect(updatedUser.isActive).toBe(false);
    });

    test('should prevent admin from changing their own role', async () => {
      // Create an admin user
      const admin = await createTestAdmin();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: admin._id.toString() };
      req.body = { role: 'user' }; // Try to demote self from admin
      req.user = { _id: admin._id }; // Same user

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toContain('Admin cannot change their own admin status');
      
      // Verify database was not updated
      const updatedUser = await User.findById(admin._id);
      expect(updatedUser.role).toBe('admin');
    });

    test('should prevent admin from deactivating themselves', async () => {
      // Create an admin user
      const admin = await createTestAdmin();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: admin._id.toString() };
      req.body = { isActive: false }; // Try to deactivate self
      req.user = { _id: admin._id }; // Same user

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toContain('Admin cannot change their own admin status or deactivate themselves');
      
      // Verify database was not updated
      const updatedUser = await User.findById(admin._id);
      expect(updatedUser.isActive).toBe(true);
    });

    test('should allow admin to ban themselves', async () => {
      // Create an admin user
      const admin = await createTestAdmin();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: admin._id.toString() };
      req.body = { isBanned: true }; // Admin can ban themselves
      req.user = { _id: admin._id }; // Same user

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify database was updated
      const updatedUser = await User.findById(admin._id);
      expect(updatedUser.isBanned).toBe(true);
    });

    test('should return 404 if user to update not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: nonExistentId.toString() };
      req.body = { role: 'editor' };
      req.user = { _id: new mongoose.Types.ObjectId() };

      await adminUserController.updateUserByAdmin(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toContain('User not found');
    });
  });

  describe('deleteUser', () => {
    test('should soft delete a user by setting isActive to false', async () => {
      // Create a test user
      const user = await createTestUser();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: user._id.toString() };
      req.user = { _id: new mongoose.Types.ObjectId() }; // Admin is not the same user

      await adminUserController.deleteUser(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'User has been deactivated successfully'
        })
      );
      
      // Verify user was soft deleted in the database
      const deletedUser = await User.findById(user._id);
      expect(deletedUser.isActive).toBe(false);
    });

    test('should prevent admin from deleting themselves', async () => {
      // Create an admin user
      const admin = await createTestAdmin();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: admin._id.toString() };
      req.user = { _id: admin._id }; // Same user

      await adminUserController.deleteUser(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toContain('Admin cannot delete their own account');
      
      // Verify user was not deleted in the database
      const notDeletedUser = await User.findById(admin._id);
      expect(notDeletedUser.isActive).toBe(true);
    });

    test('should return 404 if user to delete not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const { req, res, next } = mockRequestResponse();
      req.params = { userId: nonExistentId.toString() };
      req.user = { _id: new mongoose.Types.ObjectId() };

      await adminUserController.deleteUser(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toContain('User not found');
    });
  });
}); 