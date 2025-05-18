module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The root directory where Jest should scan for tests
  roots: ['<rootDir>'],
  
  // A list of paths to directories that Jest should use to search for files in
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // Files to ignore
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1'
  },
  
  // Set the timeout for tests to 10 seconds
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Setup files before tests are run
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}; 