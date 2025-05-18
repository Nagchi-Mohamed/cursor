/**
 * @module utils/validation
 * @description Common validation functions and patterns for form validation
 */

// Email validation regex pattern
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validates a password against requirements
 * @param {string} password - The password to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`;
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

/**
 * Validates that two passwords match
 * @param {string} password - The first password
 * @param {string} confirmPassword - The password to confirm
 * @returns {string|null} Error message if passwords don't match, null if they do
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

/**
 * Validates a name field
 * @param {string} name - The name to validate
 * @param {string} fieldName - The name of the field (e.g., 'First Name', 'Last Name')
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateName = (name, fieldName) => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
  if (!/^[a-zA-Z\s-']+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  return null;
};

/**
 * Validates a required field
 * @param {string} value - The value to validate
 * @param {string} fieldName - The name of the field
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
};

/**
 * Validates a text field length
 * @param {string} value - The value to validate
 * @param {string} fieldName - The name of the field
 * @param {number} minLength - Minimum length required
 * @param {number} maxLength - Maximum length allowed
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateLength = (value, fieldName, minLength, maxLength) => {
  if (!value) return null; // Skip length validation if field is empty (use validateRequired for that)
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return null;
}; 