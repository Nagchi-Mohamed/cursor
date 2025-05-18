import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const adminStatsService = {
  getPlatformStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/stats`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 