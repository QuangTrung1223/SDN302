/**
 * Central Error Handling Middleware for BookNest (Requirement 5)
 */

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

export const centralErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  console.error(`[ERROR_HANDLER] [${statusCode}] ${err.name || 'Error'}: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    error: err.name || (statusCode === 500 ? 'InternalServerError' : 'Error'),
    message: err.message || 'An unexpected server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
