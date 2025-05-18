import api from './api';

class UserService {
  /**
   * Get the current user's profile data
   * @returns {Promise<Object>} User profile data including achievements and learning summary
   */
  static async getUserProfile() {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile information
   * @param {Object} profileData - The updated profile data
   * @param {string} [profileData.name] - User's name
   * @param {string} [profileData.email] - User's email
   * @returns {Promise<Object>} Updated user profile data
   */
  static async updateUserProfile(profileData) {
    try {
      const response = await api.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  static async changePassword(passwordData) {
    try {
      const response = await api.put('/api/users/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - User preferences
   * @param {boolean} [preferences.darkMode] - Dark mode preference
   * @param {boolean} [preferences.emailNotifications] - Email notifications preference
   * @param {number} [preferences.dailyGoal] - Daily learning goal in minutes
   * @returns {Promise<Object>} Updated preferences
   */
  static async updateUserPreferences(preferences) {
    try {
      const response = await api.put('/api/users/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture
   * @param {FormData} formData - FormData containing the image file
   * @returns {Promise<Object>} Updated user profile with new picture URL
   */
  static async uploadProfilePicture(formData) {
    try {
      const response = await api.post('/api/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
}

export default UserService; 