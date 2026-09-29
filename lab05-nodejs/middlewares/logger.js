/**
 * Request Latency and Activity Logger Middleware
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor =
      status >= 500
        ? '\x1b[31m' // Red
        : status >= 400
        ? '\x1b[33m' // Yellow
        : status >= 300
        ? '\x1b[36m' // Cyan
        : '\x1b[32m'; // Green

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} -> ${statusColor}${status}\x1b[0m (${duration}ms)`
    );
  });

  next();
};

export default requestLogger;
