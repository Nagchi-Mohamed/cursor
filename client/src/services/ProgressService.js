import api from './api';

class ProgressService {
  /**
   * Get overall user progress statistics
   * @returns {Promise<Object>} Object containing various progress metrics
   */
  static async getOverallProgress() {
    try {
      const response = await api.get('/api/progress/overall');
      return response.data;
    } catch (error) {
      console.error('Error fetching overall progress:', error);
      throw error;
    }
  }

  /**
   * Get topic-wise performance statistics
   * @returns {Promise<Array>} Array of topic performance objects
   */
  static async getTopicPerformance() {
    try {
      const response = await api.get('/api/progress/topics');
      return response.data;
    } catch (error) {
      console.error('Error fetching topic performance:', error);
      throw error;
    }
  }

  /**
   * Get recent activity (lessons, practice sets, solved problems)
   * @param {number} limit - Number of recent activities to fetch
   * @returns {Promise<Object>} Object containing recent activities
   */
  static async getRecentActivity(limit = 5) {
    try {
      const response = await api.get('/api/progress/recent-activity', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Get recommended content based on user's progress
   * @returns {Promise<Object>} Object containing recommended content
   */
  static async getRecommendations() {
    try {
      const response = await api.get('/api/progress/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  /**
   * Get learning statistics (time spent, problems solved, etc.)
   * @returns {Promise<Object>} Object containing learning statistics
   */
  static async getLearningStats() {
    try {
      const response = await api.get('/api/progress/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching learning stats:', error);
      throw error;
    }
  }

  /**
   * Get progress over time (for charts)
   * @param {string} period - Time period ('week', 'month', 'year')
   * @returns {Promise<Array>} Array of progress data points
   */
  static async getProgressOverTime(period = 'month') {
    try {
      const response = await api.get('/api/progress/timeline', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching progress timeline:', error);
      throw error;
    }
  }

  /**
   * Get achievement badges and points
   * @returns {Promise<Object>} Object containing achievements and points
   */
  static async getAchievements() {
    try {
      const response = await api.get('/api/progress/achievements');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }
}

export default ProgressService; 