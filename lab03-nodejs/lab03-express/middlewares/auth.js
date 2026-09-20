/**
 * Authentication Middleware for /api/books (SDN302 Lab 03 - Requirement 3)
 * Protects bookstore API endpoints by verifying the 'x-api-key' header.
 * Rejects requests without or with invalid key with HTTP status 401.
 */

export const apiKeyAuth = (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY || 'booknest-secret-key-2026';

  if (!apiKeyHeader) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: "Access denied. Header 'x-api-key' is missing."
    });
  }

  if (apiKeyHeader !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: "Access denied. The provided 'x-api-key' is invalid."
    });
  }

  next();
};
