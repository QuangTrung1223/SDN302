/**
 * Application-level API Key Authentication Middleware
 */

export const apiKeyAuth = (req, res, next) => {
  const configuredKey = process.env.API_KEY || 'booknest-secret-key-2026';
  const providedKey = req.headers['x-api-key'];

  // Allow optional bypass for Swagger / documentation / simple GET if needed, or enforce x-api-key
  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: "Access denied. Valid 'x-api-key' header is required to access protected BookNest endpoints."
    });
  }

  next();
};
