/**
 * Custom Response Time Logger Middleware (SDN302)
 */

export const customLogger = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
    console.log(`[CUSTOM_LOG] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${durationMs}ms)`);
  });

  next();
};
