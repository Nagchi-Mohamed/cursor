/**
 * @module utils/authHeader
 * @description Utility function to generate an authorization header with JWT token.
 * Retrieves the token from localStorage.
 * @returns {object} Authorization header object or an empty object if no token.
 */
export default function authHeader() {
  const storedAuthState = localStorage.getItem('authState');

  if (storedAuthState) {
    try {
      const authState = JSON.parse(storedAuthState);
      if (authState && authState.token) {
        return { Authorization: `Bearer ${authState.token}` };
      }
    } catch (e) {
      console.error('Error parsing authState from localStorage:', e);
      return {};
    }
  }
  return {};
} 