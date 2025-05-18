import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1/admin';

class AdminLessonService {
  async createLesson(lessonData) {
    try {
      const response = await axios.post(`${API_URL}/lessons`, lessonData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLessons(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/lessons`, {
        headers: authHeader(),
        params
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLessonById(lessonId) {
    try {
      const response = await axios.get(`${API_URL}/lessons/${lessonId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateLesson(lessonId, lessonData) {
    try {
      const response = await axios.put(`${API_URL}/lessons/${lessonId}`, lessonData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteLesson(lessonId) {
    try {
      const response = await axios.delete(`${API_URL}/lessons/${lessonId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadLessonMedia(formData) {
    try {
      const response = await axios.post(`${API_URL}/media/upload`, formData, {
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        data: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 0,
        message: 'No response from server',
        data: null
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        message: error.message,
        data: null
      };
    }
  }
}

export default new AdminLessonService();
