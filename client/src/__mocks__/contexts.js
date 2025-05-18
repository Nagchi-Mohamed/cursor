// Mock implementations for all contexts used in the application

// Define the data objects first
const mockLanguageData = {
  language: 'en',
  setLanguage: jest.fn(),
  t: (key) => key
};

const mockAuthData = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  login: jest.fn().mockResolvedValue(true),
  logout: jest.fn().mockResolvedValue(undefined),
  signup: jest.fn().mockResolvedValue({ success: true }),
  setError: jest.fn()
};

const mockThemeData = {
  darkMode: false,
  toggleDarkMode: jest.fn()
};

// Export mock functions that will be used in tests
export const mockUseAuth = jest.fn().mockReturnValue(mockAuthData);
export const mockUseLanguage = jest.fn().mockReturnValue(mockLanguageData);
export const mockUseTheme = jest.fn().mockReturnValue(mockThemeData);

// Also export the data for direct use if needed
export const mockAuth = mockAuthData;
export const mockLanguage = mockLanguageData;
export const mockTheme = mockThemeData;
