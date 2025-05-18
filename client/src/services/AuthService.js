import axios from 'axios';

const API_URL = '/api/auth';

const AuthService = {
  // Register a new user
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    // If your backend uses JWT, you may not need a logout endpoint
    // But if you have a session or want to invalidate tokens, call the endpoint
    await axios.post(`${API_URL}/logout`);
  },

  // Get current user info
  getMe: async (token) => {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default AuthService; 