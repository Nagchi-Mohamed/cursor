import axios from 'axios';

const API_URL = '/api/practice-sets';

/**
 * Fetches all practice sets.
 * Potentially add query params for filtering later (e.g., by lessonId).
 * @param {Object} params - Query parameters for filtering practice sets
 * @returns {Promise<AxiosResponse<any>>}
 */
const getAll = (params = {}) => {
  return axios.get(API_URL, { params });
};

/**
 * Fetches a specific practice set by its ID.
 * @param {string} id - The ID of the practice set
 * @returns {Promise<AxiosResponse<any>>}
 */
const getById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

/**
 * Fetches practice sets associated with a specific lesson.
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<AxiosResponse<any>>}
 */
const getByLesson = (lessonId) => {
  return axios.get(`${API_URL}/lesson/${lessonId}`);
};

/**
 * Submits answers for a specific practice set.
 * @param {string} id - The ID of the practice set
 * @param {Object} submissionData - The submission data containing student answers
 * @param {string} submissionData.studentId - The ID of the student submitting
 * @param {Object} submissionData.answers - Object mapping question IDs to answers
 * @returns {Promise<AxiosResponse<any>>}
 */
const submitAnswers = (id, submissionData) => {
  return axios.post(`${API_URL}/${id}/submit`, submissionData);
};

/**
 * Gets submission history for a practice set.
 * @param {string} id - The ID of the practice set
 * @returns {Promise<AxiosResponse<any>>}
 */
const getSubmissions = (id) => {
  return axios.get(`${API_URL}/${id}/submissions`);
};

// Admin functions (commented out for now, to be implemented later)
/**
 * Creates a new practice set. (Admin only)
 * @param {Object} data - The practice set data
 * @returns {Promise<AxiosResponse<any>>}
 */
// const create = (data) => {
//   return axios.post(API_URL, data);
// };

/**
 * Updates an existing practice set. (Admin only)
 * @param {string} id - The ID of the practice set
 * @param {Object} data - The updated practice set data
 * @returns {Promise<AxiosResponse<any>>}
 */
// const update = (id, data) => {
//   return axios.put(`${API_URL}/${id}`, data);
// };

/**
 * Deletes a practice set. (Admin only)
 * @param {string} id - The ID of the practice set
 * @returns {Promise<AxiosResponse<any>>}
 */
// const remove = (id) => {
//   return axios.delete(`${API_URL}/${id}`);
// };

const PracticeSetService = {
  getAll,
  getById,
  getByLesson,
  submitAnswers,
  getSubmissions,
  // create,
  // update,
  // remove,
};

export default PracticeSetService; 