const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Helper to create tokens without going through the login process
const generateTestToken = (userId, role = 'user') => {
  return jwt.sign(
    { 
      userId, 
      role,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// Create a test user with specified role
const createTestUser = async (userData = {}) => {
  // Default test user data
  const defaultUserData = {
    username: `testuser_${Date.now().toString().slice(-6)}`,
    email: `testuser_${Date.now().toString().slice(-6)}@example.com`,
    password: 'Testing123!',
    role: 'user',
    isActive: true,
    isBanned: false
  };

  // Merge with provided data
  const mergedUserData = { ...defaultUserData, ...userData };
  
  // Create the user
  const user = new User(mergedUserData);

  // Set lastLogin if provided in userData
  if (userData.lastLogin) {
    user.lastLogin = userData.lastLogin;
  }

  await user.save();
  
  return user;
};

// Create an admin user
const createTestAdmin = async (userData = {}) => {
  return createTestUser({ 
    username: `testadmin_${Date.now().toString().slice(-6)}`,
    email: `testadmin_${Date.now().toString().slice(-6)}@example.com`,
    role: 'admin',
    ...userData 
  });
};

// Generate authentication header with token
const authHeader = (token) => ({
  Authorization: `Bearer ${token}`
});

// Create authenticated request header
const createAuthHeader = (userId, role = 'user') => {
  const token = generateTestToken(userId, role);
  return authHeader(token);
};

// Function to validate mongoose IDs
const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Cleanup helper to remove test users
const removeTestUsers = async (pattern = 'testuser_') => {
  await User.deleteMany({ 
    $or: [
      { username: { $regex: pattern } },
      { email: { $regex: pattern } }
    ]
  });
};

// Helper to hash a password for tests
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

module.exports = {
  generateTestToken,
  createTestUser,
  createTestAdmin,
  authHeader,
  createAuthHeader,
  isValidMongoId,
  removeTestUsers,
  hashPassword
}; 