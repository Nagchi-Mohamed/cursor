import api from './api';

class PracticeService {
  /**
   * Get all practice sets
   * @param {Object} filters - Optional filters for practice sets
   * @param {string} filters.category - Filter by category
   * @param {string} filters.difficulty - Filter by difficulty level
   * @returns {Promise<Array>} Array of practice sets
   */
  static async getPracticeSets(filters = {}) {
    try {
      const response = await api.get('/api/practice-sets', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching practice sets:', error);
      throw error;
    }
  }

  /**
   * Get a specific practice set by ID
   * @param {string} setId - ID of the practice set
   * @returns {Promise<Object>} Practice set object
   */
  static async getPracticeSet(setId) {
    try {
      const response = await api.get(`/api/practice-sets/${setId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching practice set:', error);
      throw error;
    }
  }

  /**
   * Submit an answer for a question
   * @param {string} setId - ID of the practice set
   * @param {string} questionId - ID of the question
   * @param {string|number|Array} answer - User's answer
   * @returns {Promise<Object>} Feedback object with correctness and explanation
   */
  static async submitAnswer(setId, questionId, answer) {
    try {
      const response = await api.post(`/api/practice-sets/${setId}/questions/${questionId}/answer`, {
        answer,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Submit a completed practice set
   * @param {string} setId - ID of the practice set
   * @param {Array<Object>} answers - Array of answers with question IDs
   * @returns {Promise<Object>} Results object with score and feedback
   */
  static async submitPracticeSet(setId, answers) {
    try {
      const response = await api.post(`/api/practice-sets/${setId}/submit`, {
        answers,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting practice set:', error);
      throw error;
    }
  }

  /**
   * Get user's progress for a practice set
   * @param {string} setId - ID of the practice set
   * @returns {Promise<Object>} Progress object with completion status and score
   */
  static async getPracticeSetProgress(setId) {
    try {
      const response = await api.get(`/api/practice-sets/${setId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching practice set progress:', error);
      throw error;
    }
  }

  /**
   * Get user's overall practice statistics
   * @returns {Promise<Object>} Statistics object with various metrics
   */
  static async getPracticeStatistics() {
    try {
      const response = await api.get('/api/practice-sets/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching practice statistics:', error);
      throw error;
    }
  }

  /**
   * Rate a practice set
   * @param {string} setId - ID of the practice set
   * @param {number} rating - Rating value (1-5)
   * @param {string} [feedback] - Optional feedback text
   * @returns {Promise<Object>} Updated practice set object
   */
  static async ratePracticeSet(setId, rating, feedback = '') {
    try {
      const response = await api.post(`/api/practice-sets/${setId}/rate`, {
        rating,
        feedback,
      });
      return response.data;
    } catch (error) {
      console.error('Error rating practice set:', error);
      throw error;
    }
  }
}

export default PracticeService; 