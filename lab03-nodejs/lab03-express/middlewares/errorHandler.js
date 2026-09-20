/**
 * Centralized Error & 404 Handlers (SDN302 Lab 03 - Requirement 4)
 */

/**
 * 404 Handler Middleware for unhandled routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Resource not found: Cannot ${req.method} ${req.originalUrl}`
  });
};

/**
 * Central Error-Handling Middleware with signature (err, req, res, next)
 * Returns uniform JSON error responses across all types of server errors.
 */
export const centralErrorHandler = (err, req, res, next) => {
  console.error(`[Central Error Handler] Caught error on ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
