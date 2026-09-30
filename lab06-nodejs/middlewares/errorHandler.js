/**
 * Central Error Handler Middleware (Lab 06)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[errorHandler] ✖ ${err.name || 'Error'}: ${err.message}`);
  }

  // 1. CastError: Invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid Identifier',
      statusCode: 400,
      message: `Invalid ${err.path || 'identifier'} format: '${err.value}'. Expected a valid 24-character hexadecimal ObjectId.`,
      field: err.path,
      value: err.value,
    });
  }

  // 2. ValidationError: Mongoose Schema Validation
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
      message: 'Document validation failed.',
      invalidFields: errorDetails,
      errors: messages,
    });
  }

  // 3. Duplicate Key Error: 11000
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return res.status(400).json({
      success: false,
      error: 'Duplicate Key Conflict',
      statusCode: 400,
      message: `A record with ${field} '${value}' already exists.`,
      field,
      value,
    });
  }

  // 4. Fallback 500
  const statusCode = err.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    error: err.name || 'Server Error',
    statusCode,
    message: err.message || 'Internal server error occurred.',
  });
};

export default errorHandler;
