const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const authController = require('../../controllers/authController');
const { ApiError } = require('../../middleware/errorHandler');
const { createTestUser } = require('../utils/testUtils');

describe('Auth Controller Tests', () => {
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
      cookies: {},
      user: null,
      header: jest.fn()
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();
    
    return { req, res, next };
  };

  describe('register', () => {
    test('should register a new user successfully', async () => {
      const { req, res, next } = mockRequestResponse();
      req.body = {
        username: `testregister${Date.now()}`,
        email: `testregister${Date.now()}@example.com`,
        password: 'Testing123!'
      };

      await authController.register(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Registration successful',
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              username: req.body.username,
              email: req.body.email,
              role: 'user'
            })
          })
        })
      );

      // Verify user was created in database
      const user = await User.findOne({ email: req.body.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(req.body.username);
      expect(user.role).toBe('user');
      expect(user.lastLogin).toBeTruthy();
    });

    test('should return error when email is already in use', async () => {
      // Create a user first
      const existingUser = await createTestUser({
        username: `existinguser${Date.now()}`,
        email: `existing${Date.now()}@example.com`
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        username: 'newuser',
        email: existingUser.email, // Same email
        password: 'Testing123!'
      };

      await authController.register(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('Email already in use');
    });

    test('should return error when username is already taken', async () => {
      // Create a user first
      const existingUser = await createTestUser({
        username: `existinguser${Date.now()}`,
        email: `existing${Date.now()}@example.com`
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        username: existingUser.username, // Same username
        email: 'new@example.com',
        password: 'Testing123!'
      };

      await authController.register(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('Username already taken');
    });

    test('should handle case insensitivity for email and username', async () => {
      // Create a user first
      await createTestUser({
        username: 'existinguser',
        email: 'existing@example.com'
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        username: 'EXISTINGUSER', // Different case
        email: 'EXISTING@example.com', // Different case
        password: 'Testing123!'
      };

      await authController.register(req, res, next);

      // Verify error was passed to next for email check
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('Email already in use');
    });

    test('should sanitize email and username (trim and lowercase)', async () => {
      const { req, res, next } = mockRequestResponse();
      req.body = {
        username: '  TestUser  ',
        email: '  Test@Example.COM  ',
        password: 'Testing123!'
      };

      await authController.register(req, res, next);

      // Verify user was created with sanitized data
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    test('should force regular user role for security', async () => {
      const { req, res, next } = mockRequestResponse();
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Testing123!',
        role: 'admin' // This should be ignored
      };

      await authController.register(req, res, next);

      // Verify user was created with regular user role regardless of input
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.role).toBe('user');
    });
  });

  describe('login', () => {
    test('should login user successfully with correct credentials', async () => {
      // Create a user to login
      const password = 'Testing123!';
      const user = await createTestUser({
        username: `testlogin${Date.now()}`,
        email: `testlogin${Date.now()}@example.com`,
        password,
        isActive: true,
        isBanned: false,
        lastLogin: new Date() // Ensure lastLogin is set to avoid null error
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        email: user.email,
        password
      };

      await authController.login(req, res, next);

      // Verify response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Login successful',
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              username: user.username,
              email: user.email
            })
          })
        })
      );

      // Verify lastLogin was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lastLogin).toBeInstanceOf(Date);
    });

    test('should return error with non-existent email', async () => {
      const { req, res, next } = mockRequestResponse();
      req.body = {
        email: `nonexistent${Date.now()}@example.com`,
        password: 'Testing123!'
      };

      await authController.login(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toContain('Invalid credentials');
    });

    test('should return error with incorrect password', async () => {
      // Create a user to login
      const user = await createTestUser({
        username: `testlogin_wrong_password${Date.now()}`,
        email: `testlogin_wrong_password${Date.now()}@example.com`,
        password: 'Testing123!',
        lastLogin: new Date() // Ensure lastLogin is set
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        email: user.email,
        password: 'WrongPassword123!'
      };

      await authController.login(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toContain('Invalid credentials');
    });

    test('should return error when user is banned', async () => {
      // Create a banned user
      const user = await createTestUser({
        username: `testbanned${Date.now()}`,
        email: `testbanned${Date.now()}@example.com`,
        password: 'Testing123!',
        isBanned: true
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        email: user.email,
        password: 'Testing123!'
      };

      await authController.login(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toContain('Your account has been banned');
    });

    test('should return error when user account is inactive', async () => {
      // Create an inactive user
      const user = await createTestUser({
        username: `testinactive${Date.now()}`,
        email: `testinactive${Date.now()}@example.com`,
        password: 'Testing123!',
        isActive: false
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        email: user.email,
        password: 'Testing123!'
      };

      await authController.login(req, res, next);

      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toContain('Your account is inactive');
    });

    test('should handle case insensitivity for email during login', async () => {
      // Create a user to login
      const password = 'Testing123!';
      const user = await createTestUser({
        username: `testlogin_case${Date.now()}`,
        email: `testlogin_case${Date.now()}@example.com`,
        password
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        email: user.email.toUpperCase(), // Different case
        password
      };

      await authController.login(req, res, next);

      // Verify response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        message: 'Login successful'
      }));
    });

    test('should set HTTP-only cookie in production environment', async () => {
      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      
      // Set to production for this test
      process.env.NODE_ENV = 'production';
      
      // Create a user to login
      const password = 'Testing123!';
      const user = await createTestUser({
        username: `testlogin_production${Date.now()}`,
        email: `testlogin_production${Date.now()}@example.com`,
        password,
        lastLogin: new Date() // Ensure lastLogin is set
      });

      const { req, res, next } = mockRequestResponse();
      req.body = {
        email: user.email,
        password
      };

      await authController.login(req, res, next);

      // Verify cookie was set
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: expect.any(Number)
        })
      );
      
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('getCurrentUser', () => {
    test('should return current user profile', async () => {
      const user = await createTestUser({
        username: `testcurrent${Date.now()}`,
        email: `testcurrent${Date.now()}@example.com`
      });
      
      const { req, res, next } = mockRequestResponse();
      req.user = user; // User would be attached by protect middleware
      
      await authController.getCurrentUser(req, res, next);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              username: user.username,
              email: user.email
            })
          })
        })
      );
    });
  });

  describe('updatePreferences', () => {
    test('should update user preferences successfully', async () => {
      const user = await createTestUser({
        username: `testprefs${Date.now()}`,
        email: `testprefs${Date.now()}@example.com`,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            inApp: true
          }
        }
      });
      
      const { req, res, next } = mockRequestResponse();
      req.user = user;
      req.body = {
        theme: 'dark',
        language: 'es',
        notifications: {
          email: false
        }
      };
      
      await authController.updatePreferences(req, res, next);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Preferences updated successfully'
        })
      );
      
      // Verify user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.preferences.theme).toBe('dark');
      expect(updatedUser.preferences.language).toBe('es');
      expect(updatedUser.preferences.notifications.email).toBe(false);
      // inApp should remain unchanged
      expect(updatedUser.preferences.notifications.inApp).toBe(true);
    });
    
    test('should update only specified preferences', async () => {
      const user = await createTestUser({
        username: `testprefspartial${Date.now()}`,
        email: `testprefspartial${Date.now()}@example.com`,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            inApp: true
          }
        }
      });
      
      const { req, res, next } = mockRequestResponse();
      req.user = user;
      req.body = {
        theme: 'dark'
        // Other fields not provided
      };
      
      await authController.updatePreferences(req, res, next);
      
      // Verify only theme was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.preferences.theme).toBe('dark');
      expect(updatedUser.preferences.language).toBe('en'); // Unchanged
      expect(updatedUser.preferences.notifications.email).toBe(true); // Unchanged
      expect(updatedUser.preferences.notifications.inApp).toBe(true); // Unchanged
    });
    
    test('should return error if user is not found', async () => {
      // User not in database but ID exists in request
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const { req, res, next } = mockRequestResponse();
      req.user = { 
        _id: nonExistentId,
        preferences: {
          language: 'en',
          theme: 'light'
        }
      };
      req.body = {
        theme: 'dark'
      };
      
      // Mock User.findByIdAndUpdate to return null
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);
      
      await authController.updatePreferences(req, res, next);
      
      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toContain('User not found');
      
      // Restore the original function
      User.findByIdAndUpdate.mockRestore();
    });
  });

  describe('logout', () => {
    test('should clear cookie and return success response', () => {
      const { req, res } = mockRequestResponse();
      req.cookies = { token: 'some-token' };
      
      authController.logout(req, res);
      
      // Verify cookie was cleared
      expect(res.clearCookie).toHaveBeenCalledWith('token');
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Logged out successfully'
        })
      );
    });
    
    test('should handle logout without cookie', () => {
      const { req, res } = mockRequestResponse();
      // No cookies
      
      authController.logout(req, res);
      
      // Should not try to clear cookie
      expect(res.clearCookie).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Logged out successfully'
        })
      );
    });
  });
}); 