const { validationResult } = require('express-validator');

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message
  }));

  return new ApiError(400, 'Validation Error', errors);
};

// MongoDB duplicate key error handler
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for ${field}. Please use another value.`;
  return new ApiError(400, message);
};

// MongoDB cast error handler (invalid ObjectId)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

// JWT error handlers
const handleJWTError = () => new ApiError(401, 'Invalid token. Please log in again.');
const handleJWTExpiredError = () => new ApiError(401, 'Your token has expired. Please log in again.');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Production error response
  else {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      // For validation errors, concatenate all error messages into one string
      let message = err.message;
      if (err.errors && Array.isArray(err.errors)) {
        const combinedMessages = err.errors.map(e => e.msg || e.message).join('; ');
        if (combinedMessages) {
          message = combinedMessages;
        }
      }
      res.status(err.statusCode).json({
        status: err.status,
        message,
        ...(err.errors && { errors: err.errors })
      });
    } 
    // Programming or other unknown error: don't leak error details
    else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
};

// Validation result middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation Error', errors.array()));
  }
  next();
};

module.exports = {
  ApiError,
  errorHandler,
  validateRequest,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleJWTError,
  handleJWTExpiredError
}; 