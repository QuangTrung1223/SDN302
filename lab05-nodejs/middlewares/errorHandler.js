/**
 * Central Error Handler Middleware (Requirement 4)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

/**
 * Handle 404 Not Found for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Route does not exist on this server.`,
  });
};

/**
 * Central Error Handler catching Mongoose ValidationError, CastError, and Duplicate Key 11000
 * Requirement 4: Central error handler returning readable JSON listing invalid fields and messages
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  // Log error for server-side debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[errorHandler] ✖ ${err.name || 'Error'}: ${err.message}`);
  }

  // 1. Mongoose Bad ObjectId (CastError) - Requirement 3 & 4
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid Identifier',
      statusCode: 400,
      message: `Invalid ${err.path || 'identifier'} format: '${err.value}'. Expected a valid 24-character hex MongoDB ObjectId.`,
      field: err.path,
      value: err.value,
    });
  }

  // 2. Mongoose Validation Error (ValidationError) - Requirement 4
  if (err.name === 'ValidationError') {
    const errorDetails = {};
    const messages = [];

    if (err.errors) {
      for (const [key, val] of Object.entries(err.errors)) {
        errorDetails[key] = val.message;
        messages.push(val.message);
      }
    }

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      statusCode: 400,
      message: 'Document validation failed. Please check the provided fields.',
      invalidFields: errorDetails,
      errors: messages,
    });
  }

  // 3. MongoDB Duplicate Key Error (Code 11000) - Requirement 4
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate key error: A record with ${field} '${value}' already exists.`;

    return res.status(400).json({
      success: false,
      error: 'Duplicate Key Conflict',
      statusCode: 400,
      message,
      field,
      value,
    });
  }

  // 4. Fallback: Internal Server Error (500)
  const statusCode = err.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    error: err.name || 'Server Error',
    statusCode,
    message: err.message || 'Internal server error occurred.',
  });
};

export default errorHandler;
