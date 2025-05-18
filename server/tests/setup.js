// Load environment variables from .env.test if it exists, otherwise from .env
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

// Set test environment
process.env.NODE_ENV = 'test';

// Use a test database
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/mathsphere_test';

// Set a consistent JWT secret for tests
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-jwt-secret-key-for-testing-only';

// Set shorter expiration time for tests
process.env.JWT_EXPIRES_IN = '1h';

// Clear database hooks
const mongoose = require('mongoose');

// Disconnect from MongoDB after all tests complete
afterAll(async () => {
  await mongoose.connection.close();
});

// Set console.error to not output during tests to keep output clean
// But keep original for debugging if needed
const originalConsoleError = console.error;
global.originalConsoleError = originalConsoleError;

console.error = (...args) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleError(...args);
  }
};

// Create a helper function for database connection
global.connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    global.originalConsoleError('Database connection error:', error);
    throw error;
  }
};

// Reset database between tests
global.clearDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await global.connectToDatabase();
  }
  
  const collections = Object.keys(mongoose.connection.collections);
  
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
}; 