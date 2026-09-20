/**
 * Custom Logger Middleware (SDN302 Lab 03 - Requirement 3)
 * Records request method, URL, status code, and response time in milliseconds.
 */

export const customLogger = (req, res, next) => {
  const startHrTime = process.hrtime();
  const startTime = Date.now();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
    const timestamp = new Date(startTime).toISOString();

    console.log(
      `[Custom Logger] [${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${elapsedMs} ms)`
    );
  });

  next();
};
