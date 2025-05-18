import api from './api';

class FeedbackService {
  /**
   * Submit user feedback
   * @param {string} feedbackText - The feedback text
   * @param {Object} context - Additional context about the feedback
   * @param {string} context.type - Type of feedback ('lesson', 'practice', 'general')
   * @param {string} [context.contentId] - ID of the related content (lesson/practice set)
   * @param {string} [context.pageUrl] - Current page URL
   * @returns {Promise<Object>} Response from the server
   */
  static async submitFeedback(feedbackText, context) {
    try {
      const response = await api.post('/api/feedback', {
        feedback: feedbackText,
        ...context,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback history for the current user
   * @returns {Promise<Array>} Array of feedback submissions
   */
  static async getFeedbackHistory() {
    try {
      const response = await api.get('/api/feedback/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      throw error;
    }
  }
}

export default FeedbackService; 