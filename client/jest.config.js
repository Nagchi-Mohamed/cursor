module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|scss|sass|less)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@mui|@babel|@emotion)/)',
  ],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.{js,jsx,ts,tsx}',
    '!src/serviceWorker.{js,jsx,ts,tsx}',
    '!src/reportWebVitals.{js,jsx,ts,tsx}',
    '!src/setupTests.{js,jsx,ts,tsx}',
    '!src/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: false,
  moduleDirectories: ['node_modules', 'src'],
  
  // Map module paths to their mock implementations
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  
  // Set mock file paths priority
  // This helps Jest find the mock files within component directories
  unmockedModulePathPatterns: [],
  
  // Enable automatic mock cleanup between tests
  clearMocks: true,
  
  // Custom resolver for module imports (if needed)
  resolver: undefined,

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
