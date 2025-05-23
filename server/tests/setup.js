// Load environment variables from .env.test if it exists, otherwise from .env
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

// Set test environment
process.env.NODE_ENV = 'test';

// Set a consistent JWT secret for tests
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-jwt-secret-key-for-testing-only';

// Set shorter expiration time for tests
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Suppress console.error output during tests unless DEBUG_TESTS is set
const originalConsoleError = console.error;
global.originalConsoleError = originalConsoleError;

console.error = (...args) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleError(...args);
  }
};

// Retry connection helper
const connectWithRetry = async (mongoUri, config, retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongoUri, config);
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// Global setup with connection retries and in-memory MongoDB
global.connectToDatabase = async () => {
  try {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create();
    }
    const mongoUri = mongoServer.getUri();

    const mongooseConfig = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 30000, // 30 seconds socket timeout
      serverSelectionTimeoutMS: 30000, // 30 seconds server selection timeout
    };

    await connectWithRetry(mongoUri, mongooseConfig);
    return mongoose.connection;
  } catch (error) {
    global.originalConsoleError('Database connection error:', error);
    throw error;
  }
};

// Global teardown
global.disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  } catch (error) {
    global.originalConsoleError('Database disconnection error:', error);
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

// Disconnect and stop in-memory MongoDB after all tests complete
afterAll(async () => {
  await global.disconnectDatabase();
});
