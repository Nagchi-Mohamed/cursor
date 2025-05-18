import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/v1/admin/users';

const AdminUserService = {
  // Get a paginated, filtered, and sorted list of users
  getUsers: async (params = {}) => {
    const { page, limit, keyword, role, isBanned, isActive, sortBy, sortOrder } = params;
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (keyword) queryParams.append('keyword', keyword);
    if (role) queryParams.append('role', role);
    if (isBanned !== undefined) queryParams.append('isBanned', isBanned);
    if (isActive !== undefined) queryParams.append('isActive', isActive);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;
    
    try {
      const response = await axios.get(url, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error fetching users';
    }
  },
  
  // Get a single user by ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error fetching user';
    }
  },
  
  // Update a user's role or status
  updateUserByAdmin: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}`, userData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error updating user';
    }
  },
  
  // Delete a user (soft delete)
  deleteUserByAdmin: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/${userId}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error deleting user';
    }
  }
};

export default AdminUserService;
