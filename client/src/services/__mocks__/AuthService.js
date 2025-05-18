// Mock implementation of AuthService for testing
const AuthService = {
  register: jest.fn().mockImplementation((userData) => {
    return Promise.resolve({
      token: 'fake-token',
      user: { ...userData, id: '123', role: 'user' },
      message: 'Registration successful'
    });
  }),

  login: jest.fn().mockImplementation((credentials) => {
    return Promise.resolve({
      token: 'fake-token',
      user: { 
        id: '123', 
        email: credentials.email, 
        name: 'Test User',
        role: 'user'
      },
      message: 'Login successful'
    });
  }),

  logout: jest.fn().mockImplementation(() => {
    return Promise.resolve({ message: 'Logout successful' });
  }),

  getMe: jest.fn().mockImplementation((token) => {
    if (token === 'fake-token') {
      return Promise.resolve({ 
        id: '123', 
        email: 'test@example.com', 
        name: 'Test User',
        role: 'user'
      });
    } else {
      return Promise.reject(new Error('Invalid token'));
    }
  }),
};

export default AuthService; 