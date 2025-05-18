import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/v1/admin/feedback';

const AdminFeedbackService = {
  // Get a paginated, filtered, and sorted list of feedback items
  getFeedbackItems: async (params = {}) => {
    const { page, limit, status, search, sortBy, sortOrder } = params;
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;
    
    try {
      const response = await axios.get(url, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error fetching feedback items';
    }
  },
  
  // Get a single feedback item by ID
  getFeedbackItemById: async (feedbackId) => {
    try {
      const response = await axios.get(`${API_URL}/${feedbackId}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error fetching feedback item';
    }
  },
  
  // Update a feedback item's status
  updateFeedbackStatus: async (feedbackId, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/${feedbackId}`, 
        { status }, 
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error updating feedback status';
    }
  },
  
  // Archive/delete a feedback item
  archiveFeedbackItem: async (feedbackId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${feedbackId}`, 
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Error archiving feedback item';
    }
  }
};

export default AdminFeedbackService; 