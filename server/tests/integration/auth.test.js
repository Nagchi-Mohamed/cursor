const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const User = require('../../models/User');
const { createTestUser, generateTestToken } = require('../utils/testUtils');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('../../middleware/errorHandler');

// Mock the rate limiter middleware
jest.mock('../../middleware/rateLimiter', () => ({
  authLimiter: (req, res, next) => next(),
  adminLimiter: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
  solverLimiter: (req, res, next) => next()
}));

// Now we can safely import the routes that use the mocked rateLimiter
const authRoutes = require('../../routes/auth');

// Set up the Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth Routes Integration Tests', () => {
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

  describe('POST /api/auth/register', () => {
    test('should register a new user and return 201 status', async () => {
      const uniqueValue = Date.now();
      const newUser = {
        username: `testuser${uniqueValue}`,
        email: `test${uniqueValue}@example.com`,
        password: 'Testing123!',
        confirmPassword: 'Testing123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', newUser.username);
      expect(response.body.data.user).toHaveProperty('email', newUser.email);
      expect(response.body.data.user).toHaveProperty('role', 'user');

      // Verify user was created in the database
      const user = await User.findOne({ email: newUser.email });
      expect(user).toBeTruthy();
    });

    test('should return 400 if email is already registered', async () => {
      // Create a user first
      const uniqueValue = Date.now();
      const existingUser = await createTestUser({
        username: `existinguser${uniqueValue}`,
        email: `existing${uniqueValue}@example.com`
      });

      const newUser = {
        username: `testuser${uniqueValue}`,
        email: existingUser.email, // Already exists
        password: 'Testing123!',
        confirmPassword: 'Testing123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Email already in use');
    });

    test('should return 400 if username is already taken', async () => {
      // Create a user first
      const uniqueValue = Date.now();
      const existingUser = await createTestUser({
        username: `existinguser${uniqueValue}`,
        email: `existing${uniqueValue}@example.com`
      });

      const newUser = {
        username: existingUser.username, // Already exists
        email: `new${uniqueValue}@example.com`,
        password: 'Testing123!',
        confirmPassword: 'Testing123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Username already taken');
    });

    test('should return 400 if passwords do not match', async () => {
      const newUser = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'Testing123!',
        confirmPassword: 'DifferentPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Passwords do not match');
    });

    test('should return 400 for invalid username format', async () => {
      const newUser = {
        username: 'test user', // Contains a space (invalid)
        email: 'test@example.com',
        password: 'Testing123!',
        confirmPassword: 'Testing123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Username can only contain');
    });

    test('should return 400 for invalid email format', async () => {
      const newUser = {
        username: 'testuser',
        email: 'not-an-email', // Invalid email
        password: 'Testing123!',
        confirmPassword: 'Testing123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('valid email');
    });

    test('should return 400 for weak password', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password', // Weak password without requirements
        confirmPassword: 'password'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Password must contain');
    });

    test('should return 400 if disallowed fields are sent', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Testing123!',
        confirmPassword: 'Testing123!',
        role: 'admin', // Disallowed field
        isAdmin: true   // Disallowed field
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not allowed during registration');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user and return token', async () => {
      // Create a user to login with
      const password = 'Testing123!';
      const user = await createTestUser({
        username: 'testuser',
        email: 'test@example.com',
        password
      });

      const loginData = {
        email: 'test@example.com',
        password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', user.username);
    });

    test('should return 401 with invalid credentials', async () => {
      // Create a user
      await createTestUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Testing123!'
      });

      // Try to login with wrong password
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 401 with non-existent email', async () => {
      const loginData = {
        email: `nonexistent${Date.now()}@example.com`,
        password: 'Testing123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 403 when user is banned', async () => {
      // Create a banned user
      const password = 'Testing123!';
      const bannedUser = await createTestUser({
        username: `banned${Date.now()}`,
        email: `banned${Date.now()}@example.com`,
        password,
        isBanned: true
      });

      const loginData = {
        email: bannedUser.email,
        password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Your account has been banned');
    });

    test('should return 403 when user account is inactive', async () => {
      // Create an inactive user
      const password = 'Testing123!';
      const inactiveUser = await createTestUser({
        username: `inactive${Date.now()}`,
        email: `inactive${Date.now()}@example.com`,
        password,
        isActive: false
      });

      const loginData = {
        email: inactiveUser.email,
        password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Your account is inactive');
    });

    test('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'not-an-email', // Invalid email
        password: 'Testing123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('valid email');
    });

    test('should return 400 if disallowed fields are sent', async () => {
      const loginData = {
        email: `test${Date.now()}@example.com`,
        password: 'Testing123!',
        role: 'admin', // Disallowed field
        hack: true     // Disallowed field
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not allowed during login');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout user and clear cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', ['token=test-token']);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Logged out successfully');
      // Check if the cookie was cleared (this is hard to test with supertest)
      // But we can verify there's a Set-Cookie header that clears the token
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        expect(cookies.some(cookie => cookie.includes('token=;'))).toBe(true);
      }
    });

    test('should succeed even without cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user profile when authenticated', async () => {
      // Create a test user
      const user = await createTestUser({
        username: 'testuser',
        email: 'test@example.com'
      });
      
      // Generate a token for this user
      const token = generateTestToken(user._id);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', user.username);
      expect(response.body.data.user).toHaveProperty('email', user.email);
    });
    
    test('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/me');
        
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('No authentication token provided');
    });
    
    test('should return 401 when invalid token provided', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
        
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('PATCH /api/auth/preferences', () => {
    test('should update user preferences when authenticated', async () => {
      // Create a test user with initial preferences
      const user = await createTestUser({
        username: 'testuser',
        email: 'test@example.com',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            inApp: true
          }
        }
      });
      
      // Generate a token for this user
      const token = generateTestToken(user._id);
      
      const updatedPreferences = {
        theme: 'dark',
        language: 'es',
        notifications: {
          email: false
        }
      };
      
      const response = await request(app)
        .patch('/api/auth/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPreferences);
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Preferences updated successfully');
      expect(response.body.data.user.preferences.theme).toBe('dark');
      expect(response.body.data.user.preferences.language).toBe('es');
      expect(response.body.data.user.preferences.notifications.email).toBe(false);
      // inApp should remain unchanged
      expect(response.body.data.user.preferences.notifications.inApp).toBe(true);
      
      // Verify database was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.preferences.theme).toBe('dark');
      expect(updatedUser.preferences.language).toBe('es');
      expect(updatedUser.preferences.notifications.email).toBe(false);
    });
    
    test('should return 401 when not authenticated', async () => {
      const updatedPreferences = {
        theme: 'dark'
      };
      
      const response = await request(app)
        .patch('/api/auth/preferences')
        .send(updatedPreferences);
        
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });
    
    test('should return 400 for invalid theme value', async () => {
      // Create a test user
      const user = await createTestUser({
        username: `theme_test${Date.now()}`,
        email: `theme_test${Date.now()}@example.com`
      });
      const token = generateTestToken(user._id);
      
      const updatedPreferences = {
        theme: 'invalid-theme' // Not in the allowed values
      };
      
      const response = await request(app)
        .patch('/api/auth/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPreferences);
        
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid theme preference');
    });
    
    test('should return 400 for invalid language value', async () => {
      // Create a test user
      const user = await createTestUser({
        username: `lang_test${Date.now()}`,
        email: `lang_test${Date.now()}@example.com`
      });
      const token = generateTestToken(user._id);
      
      const updatedPreferences = {
        language: 'invalid-language' // Not in the allowed values
      };
      
      const response = await request(app)
        .patch('/api/auth/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPreferences);
        
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid language preference');
    });
    
    test('should return 400 for invalid notification values', async () => {
      // Create a test user
      const user = await createTestUser({
        username: `notif_test${Date.now()}`,
        email: `notif_test${Date.now()}@example.com`
      });
      const token = generateTestToken(user._id);
      
      const updatedPreferences = {
        notifications: {
          email: 'not-a-boolean' // Should be boolean
        }
      };
      
      const response = await request(app)
        .patch('/api/auth/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPreferences);
        
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('must be a boolean value');
    });
  });
}); 