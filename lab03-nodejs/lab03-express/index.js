import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { customLogger } from './middlewares/logger.js';
import { apiKeyAuth } from './middlewares/auth.js';
import { notFoundHandler, centralErrorHandler } from './middlewares/errorHandler.js';
import bookRouter from './routes/bookRouter.js';

// Load environment variables from .env file (Requirement 1)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Read port from environment variable with 3000 as fallback (Requirement 1)
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Built-in & Third-party Middleware (Requirement 3)
// ==========================================

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: true }));

// Third-party middleware (morgan) to log every incoming request
app.use(morgan('dev'));

// Custom response-time logger middleware (Requirement 3)
app.use(customLogger);

// ==========================================
// 2. Base Application Routes (Requirement 1)
// ==========================================

// Root route returning a welcome message (Requirement 1)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to BookNest Online Bookstore API (SDN302 Lab 03)!',
    documentation: '/index.html',
    endpoints: {
      health: 'GET /health',
      books: 'GET, POST /api/books (requires x-api-key header)',
      bookDetail: 'GET, PUT, DELETE /api/books/:id (requires x-api-key header)',
      errorTest: 'GET /api/books/error-test (requires x-api-key header)'
    }
  });
});

// Serve static files from the 'public' directory (Requirement 3)
// Configured with index: false so GET / serves root route while /index.html serves static UI
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// /health route returning { status: 'OK', uptime } (Requirement 1)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 3. Application-level Auth & Resource Routing (Requirement 2 & 3)
// ==========================================

// Application-level middleware that only applies to /api/books and rejects missing/invalid x-api-key (Requirement 3)
// Mounted with bookRouter for /api/books (Requirement 2)
app.use('/api/books', apiKeyAuth, bookRouter);

// ==========================================
// 4. Centralized Error Handlers (Requirement 4)
// ==========================================

// 404 middleware for unknown routes (Requirement 4)
app.use(notFoundHandler);

// Central error-handling middleware with signature (err, req, res, next) (Requirement 4)
app.use(centralErrorHandler);

// ==========================================
// 5. Start Server (when executed directly)
// ==========================================
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  BookNest Express API Server running on port ${PORT}`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/health`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

export default app;
