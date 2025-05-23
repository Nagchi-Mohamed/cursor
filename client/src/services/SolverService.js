import axios from 'axios';
import api from './api';

const API_URL = '/api/solver';

/**
 * Submits a math problem for solving.
 * @param {Object} problemData - The problem data
 * @param {string} problemData.input - The raw input (LaTeX, text, etc.)
 * @param {string} problemData.inputType - The type of input ('latex', 'text', 'image')
 * @returns {Promise<AxiosResponse<any>>}
 */
export const solveProblem = async (problemData) => {
  const response = await axios.post(API_URL + '/query-wolfram', { query: problemData.input });
  return response.data;
};

/**
 * Gets the solution history for the current user.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getHistory = () => {
  return axios.get(API_URL + '/history');
};

/**
 * Gets a specific solution by ID.
 * @param {string} solutionId - The ID of the solution
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getSolution = (solutionId) => {
  return axios.get(API_URL + '/solutions/' + solutionId);
};

/**
 * Process an image containing a math expression
 * @param {File} imageFile - The image file to process
 * @returns {Promise<Object>} The recognized math expression in LaTeX format
 */
export const processImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/api/solver/ocr-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

/**
 * Process voice input for math expression
 * @param {Blob} audioBlob - The audio data to process
 * @returns {Promise<Object>} The recognized math expression in LaTeX format
 */
export const processVoiceInput = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await api.post('/api/solver/voice-input', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error processing voice input:', error);
    throw error;
  }
};
