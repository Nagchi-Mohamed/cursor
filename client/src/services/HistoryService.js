import api from './api';

class HistoryService {
  /**
   * Get recent solutions for the current user
   * @param {number} limit - Maximum number of solutions to return
   * @returns {Promise<Array>} Array of solution history items
   */
  static async getRecentSolutions(limit = 10) {
    try {
      const response = await api.get(`/api/solutions/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching solution history:', error);
      throw error;
    }
  }

  /**
   * Save a solution to history
   * @param {Object} solution - Solution object to save
   * @param {string} solution.problem - The original problem
   * @param {Object} solution.solution - The solution object from Wolfram Alpha
   * @param {string} solution.timestamp - ISO timestamp
   * @returns {Promise<Object>} Saved solution object
   */
  static async saveSolution(solution) {
    try {
      const response = await api.post('/api/solutions/history', solution);
      return response.data;
    } catch (error) {
      console.error('Error saving solution:', error);
      throw error;
    }
  }

  /**
   * Delete a solution from history
   * @param {string} solutionId - ID of the solution to delete
   * @returns {Promise<void>}
   */
  static async deleteSolution(solutionId) {
    try {
      await api.delete(`/api/solutions/history/${solutionId}`);
    } catch (error) {
      console.error('Error deleting solution:', error);
      throw error;
    }
  }

  /**
   * Get a specific solution by ID
   * @param {string} solutionId - ID of the solution to retrieve
   * @returns {Promise<Object>} Solution object
   */
  static async getSolution(solutionId) {
    try {
      const response = await api.get(`/api/solutions/history/${solutionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching solution:', error);
      throw error;
    }
  }
}

export default HistoryService; 