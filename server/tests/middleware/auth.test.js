const { protect, optionalAuth } = require('../../middleware/auth');
const User = require('../../models/User');
const { ApiError } = require('../../middleware/errorHandler');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateTestToken } = require('../utils/testUtils');

// Mock Express request and response objects
const mockRequestResponse = () => {
  const req = {
    header: jest.fn(),
    cookies: {}
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('Authentication Middleware Tests', () => {
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

  describe('protect middleware', () => {
    test('should call next() when valid token is provided', async () => {
      // Create a test user directly with mongoose to avoid any model validation issues
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
        isActive: true,
        isBanned: false,
        comparePassword: jest.fn().mockResolvedValue(true),
        getPublicProfile: jest.fn().mockReturnValue({
          _id: userId,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        })
      };

      // Setup request mock
      const { req, res, next } = mockRequestResponse();
      const token = generateTestToken(userId, 'user');
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      // Mock the User.findById to return our user object
      jest.spyOn(User, 'findById').mockImplementation(() => {
        return {
          select: jest.fn().mockReturnValue(Promise.resolve(user))
        };
      });

      // Call middleware
      await protect(req, res, next);

      // Should call next with no error
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.token).toBe(`Bearer ${token}`);

      // Restore original implementation
      User.findById.mockRestore();
    });

    test('should return 401 when no authorization header is provided', async () => {
      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(undefined);

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Access denied. No authentication token provided.');
    });

    test('should return 401 when invalid token is provided', async () => {
      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue('Bearer invalid-token');

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Invalid token. Please login again.');
    });

    test('should return 401 when token is for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const token = generateTestToken(nonExistentId);

      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      // Mock the User.findById to return null
      jest.spyOn(User, 'findById').mockImplementation(() => {
        return {
          select: jest.fn().mockReturnValue(Promise.resolve(null))
        };
      });

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('User associated with this token no longer exists.');

      // Restore original implementation
      User.findById.mockRestore();
    });

    test('should return 403 when user is banned', async () => {
      // Create a banned user
      const userId = new mongoose.Types.ObjectId();
      const bannedUser = {
        _id: userId,
        username: 'banneduser',
        email: 'banned@example.com',
        password: 'hashedpassword',
        role: 'user',
        isActive: true,
        isBanned: true, // User is banned
        comparePassword: jest.fn().mockResolvedValue(true),
        getPublicProfile: jest.fn()
      };

      const token = generateTestToken(userId, 'user');

      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      // Mock the User.findById to return our banned user
      jest.spyOn(User, 'findById').mockImplementation(() => {
        return {
          select: jest.fn().mockReturnValue(Promise.resolve(bannedUser))
        };
      });

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Your account has been banned. Please contact support.');

      // Restore original implementation
      User.findById.mockRestore();
    });

    test('should return 403 when user is inactive', async () => {
      // Create an inactive user
      const userId = new mongoose.Types.ObjectId();
      const inactiveUser = {
        _id: userId,
        username: 'inactiveuser',
        email: 'inactive@example.com',
        password: 'hashedpassword',
        role: 'user',
        isActive: false, // User is inactive
        isBanned: false,
        comparePassword: jest.fn().mockResolvedValue(true),
        getPublicProfile: jest.fn()
      };

      const token = generateTestToken(userId, 'user');

      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      // Mock the User.findById to return our inactive user
      jest.spyOn(User, 'findById').mockImplementation(() => {
        return {
          select: jest.fn().mockReturnValue(Promise.resolve(inactiveUser))
        };
      });

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Your account is inactive. Please contact support.');

      // Restore original implementation
      User.findById.mockRestore();
    });

    test('should update lastLogin time if it is more than 1 hour old', async () => {
      // Create a user with an old lastLogin
      const userId = new mongoose.Types.ObjectId();
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 2); // 2 hours ago
      
      const user = {
        _id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
        isActive: true,
        isBanned: false,
        lastLogin: oldDate,
        comparePassword: jest.fn().mockResolvedValue(true),
        getPublicProfile: jest.fn().mockReturnValue({
          _id: userId,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        })
      };

      const token = generateTestToken(userId, 'user');

      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      // Mock User.findById 
      jest.spyOn(User, 'findById').mockImplementation(() => {
        return {
          select: jest.fn().mockReturnValue(Promise.resolve(user))
        };
      });

      // Mock User.findByIdAndUpdate
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue(user);

      await protect(req, res, next);

      // Should update lastLogin
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { lastLogin: expect.any(Object) }
      );
      expect(next).toHaveBeenCalledWith();

      // Restore original implementation
      User.findById.mockRestore();
      User.findByIdAndUpdate.mockRestore();
    });
  });

  describe('optionalAuth middleware', () => {
    test('should attach user to request when valid token is provided', async () => {
      // Create a test user
      const userId = new mongoose.Types.ObjectId();
      const user = {
        _id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
        isActive: true,
        isBanned: false,
        comparePassword: jest.fn().mockResolvedValue(true),
        getPublicProfile: jest.fn().mockReturnValue({
          _id: userId,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        })
      };
      
      const token = generateTestToken(userId, 'user');

      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      // Mock User.findById 
      jest.spyOn(User, 'findById').mockImplementation(() => {
        return {
          select: jest.fn().mockReturnValue(Promise.resolve(user))
        };
      });

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user._id).toBe(userId);

      // Restore original implementation
      User.findById.mockRestore();
    });

    test('should call next() without user when no token is provided', async () => {
      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(undefined);

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });

    test('should call next() without user when invalid token is provided', async () => {
      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue('Bearer invalid-token');

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });

    test('should not attach user when user is banned', async () => {
      // Create a banned user
      const userId = new mongoose.Types.ObjectId();
      const bannedUser = {
        _id: userId,
        username: 'banneduser',
        email: 'banned@example.com',
        password: 'hashedpassword',
        role: 'user',
        isActive: true,
        isBanned: true, // User is banned
      };
      
      const token = generateTestToken(userId, 'user');

      const { req, res, next } = mockRequestResponse();
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      // Mock User.findById 
      jest.spyOn(User, 'findById').mockImplementation(() => {
        return {
          select: jest.fn().mockReturnValue(Promise.resolve(bannedUser))
        };
      });

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();

      // Restore original implementation
      User.findById.mockRestore();
    });
  });
}); 