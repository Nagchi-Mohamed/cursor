const { isAdmin, isEditorOrAdmin } = require('../../middleware/adminAuth');
const { ApiError } = require('../../middleware/errorHandler');
const mongoose = require('mongoose');
const { createTestUser, createTestAdmin } = require('../utils/testUtils');

// Mock req, res, next for middleware tests
const mockRequestResponse = (user = null) => {
  const req = { user };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('Admin Authentication Middleware Tests', () => {
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

  describe('isAdmin middleware', () => {
    test('should call next() when user has admin role', async () => {
      // Create an admin user
      const admin = await createTestAdmin();

      // Setup request mock
      const { req, res, next } = mockRequestResponse(admin);

      // Call middleware
      await isAdmin(req, res, next);

      // Should call next with no error
      expect(next).toHaveBeenCalledWith();
    });

    test('should return 401 when no user is attached to request', async () => {
      // Setup request mock with no user
      const { req, res, next } = mockRequestResponse();

      // Call middleware
      await isAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Authentication required. Please login.');
    });

    test('should return 403 when user does not have admin role', async () => {
      // Create a regular user
      const regularUser = await createTestUser();

      // Setup request mock
      const { req, res, next } = mockRequestResponse(regularUser);

      // Call middleware
      await isAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Access denied. Admin privileges required.');
    });

    test('should return 404 when user no longer exists in database', async () => {
      // Create a user that doesn't exist in database
      const nonExistentUser = {
        _id: new mongoose.Types.ObjectId(),
        role: 'admin'
      };

      // Setup request mock
      const { req, res, next } = mockRequestResponse(nonExistentUser);

      // Call middleware
      await isAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('User no longer exists.');
    });

    test('should return 403 when user role has been changed from admin', async () => {
      // Create an admin user
      const admin = await createTestAdmin();
      
      // Change the role in the database but not in the request
      admin.role = 'user';
      await admin.save();

      // Setup request mock with outdated role
      const { req, res, next } = mockRequestResponse({
        _id: admin._id,
        role: 'admin' // This is now different from the database
      });

      // Call middleware
      await isAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Access denied. Your role has been changed. Please login again.');
    });

    test('should return 403 when admin is banned', async () => {
      // Create an admin user that is banned
      const bannedAdmin = await createTestAdmin({ isBanned: true });

      // Setup request mock
      const { req, res, next } = mockRequestResponse(bannedAdmin);

      // Call middleware
      await isAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Your account has been banned. Please contact support.');
    });

    test('should return 403 when admin account is inactive', async () => {
      // Create an inactive admin user
      const inactiveAdmin = await createTestAdmin({ isActive: false });

      // Setup request mock
      const { req, res, next } = mockRequestResponse(inactiveAdmin);

      // Call middleware
      await isAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Your account is inactive. Please contact support.');
    });
  });

  describe('isEditorOrAdmin middleware', () => {
    test('should call next() when user has admin role', async () => {
      // Create an admin user
      const admin = await createTestAdmin();

      // Setup request mock
      const { req, res, next } = mockRequestResponse(admin);

      // Call middleware
      await isEditorOrAdmin(req, res, next);

      // Should call next with no error
      expect(next).toHaveBeenCalledWith();
    });

    test('should call next() when user has editor role', async () => {
      // Create an editor user
      const editor = await createTestUser({ role: 'editor' });

      // Setup request mock
      const { req, res, next } = mockRequestResponse(editor);

      // Call middleware
      await isEditorOrAdmin(req, res, next);

      // Should call next with no error
      expect(next).toHaveBeenCalledWith();
    });

    test('should return 401 when no user is attached to request', async () => {
      // Setup request mock with no user
      const { req, res, next } = mockRequestResponse();

      // Call middleware
      await isEditorOrAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Authentication required. Please login.');
    });

    test('should return 403 when user does not have editor or admin role', async () => {
      // Create a regular user
      const regularUser = await createTestUser();

      // Setup request mock
      const { req, res, next } = mockRequestResponse(regularUser);

      // Call middleware
      await isEditorOrAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Access denied. Editor or admin privileges required.');
    });

    test('should return 403 when editor is banned', async () => {
      // Create an editor that is banned
      const bannedEditor = await createTestUser({ role: 'editor', isBanned: true });

      // Setup request mock
      const { req, res, next } = mockRequestResponse(bannedEditor);

      // Call middleware
      await isEditorOrAdmin(req, res, next);

      // Should call next with an error
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Your account has been banned. Please contact support.');
    });
  });
}); 