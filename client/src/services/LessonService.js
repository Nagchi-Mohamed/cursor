import api from './api';

class LessonService {
  /**
   * Get all lessons
   * @returns {Promise<Array>} Array of lessons
   */
  static async getLessons() {
    try {
      const response = await api.get('/api/lessons');
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  }

  /**
   * Get a specific lesson by ID
   * @param {string} lessonId - The ID of the lesson to fetch
   * @returns {Promise<Object>} The lesson object
   */
  static async getLesson(lessonId) {
    try {
      const response = await api.get(`/api/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  }

  /**
   * Rate a lesson
   * @param {string} lessonId - The ID of the lesson to rate
   * @param {number} rating - The rating value (1-5)
   * @returns {Promise<Object>} The updated lesson object
   */
  static async rateLesson(lessonId, rating) {
    try {
      const response = await api.post(`/api/lessons/${lessonId}/rate`, { rating });
      return response.data;
    } catch (error) {
      console.error('Error rating lesson:', error);
      throw error;
    }
  }

  /**
   * Get related content for a lesson
   * @param {string} lessonId - The ID of the lesson
   * @returns {Promise<Object>} Object containing related lessons and practice sets
   */
  static async getRelatedContent(lessonId) {
    try {
      const response = await api.get(`/api/lessons/${lessonId}/related`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related content:', error);
      throw error;
    }
  }

  /**
   * Get lessons by category
   * @param {string} category - The category to filter by
   * @returns {Promise<Array>} Array of lessons in the category
   */
  static async getLessonsByCategory(category) {
    try {
      const response = await api.get(`/api/lessons/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons by category:', error);
      throw error;
    }
  }

  /**
   * Search lessons
   * @param {string} query - The search query
   * @returns {Promise<Array>} Array of matching lessons
   */
  static async searchLessons(query) {
    try {
      const response = await api.get('/api/lessons/search', {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching lessons:', error);
      throw error;
    }
  }
}

export default LessonService; 