/**
 * BookNest Online Bookstore - Server Entry Point (Lab 05)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from './config/db.js';
import bookRouter from './routes/bookRouter.js';
import categoryRouter from './routes/categoryRouter.js';
import requestLogger from './middlewares/logger.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsers & Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root Endpoint: Serves Web UI for browsers, JSON index for API clients
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  res.status(200).json({
    message: 'Welcome to BookNest Online Bookstore API (Lab 05 - Mongoose ODM)',
    student: 'Nguyen Le Quang Trung (DS190284)',
    course: 'SDN302 - Server-side Development with NodeJS, Express and MongoDB',
    technology: 'Node.js, Express, Mongoose ODM, MongoDB',
    endpoints: {
      health: 'GET /api/health',
      books: {
        list: 'GET /api/books (supports ?category=&minPrice=&maxPrice=&keyword=&sort=&select=&page=&limit=)',
        byId: 'GET /api/books/:id',
        create: 'POST /api/books',
        update: 'PUT /api/books/:id',
        delete: 'DELETE /api/books/:id',
        byCategoryStatic: 'GET /api/books/by-category/:category (Requirement 5 Static Method)',
        summaryInstance: 'GET /api/books/:id/summary (Requirement 5 Instance Method)',
      },
      categories: {
        list: 'GET /api/categories',
        byId: 'GET /api/categories/:id',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id',
      },
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
  });
});

// Mount Resource Routers
app.use('/api/books', bookRouter);
app.use('/api/categories', categoryRouter);

// 404 Route Handler
app.use(notFoundHandler);

// Central Error Handler (Requirement 4)
app.use(errorHandler);

let server = null;

/**
 * Start Express Server with Mongoose Database Connection
 * @param {number} [customPort]
 * @returns {Promise<http.Server>}
 */
export const startServer = async (customPort = null) => {
  const listenPort = customPort || PORT;

  // Connect to MongoDB using Mongoose (Requirement 1)
  await connectDB();

  return new Promise((resolve) => {
    server = app.listen(listenPort, () => {
      console.log(`[index.js] 🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://127.0.0.1:${listenPort}`);
      resolve(server);
    });
  });
};

/**
 * Stop Server and close MongoDB connection gracefully
 */
export const stopServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('[index.js] HTTP server stopped.');
  }
  await disconnectDB();
};

// Graceful process shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n[index.js] Received SIGINT. Performing graceful shutdown...');
  await stopServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[index.js] Received SIGTERM. Performing graceful shutdown...');
  await stopServer();
  process.exit(0);
});

// Auto-start server if executed directly (e.g. `node index.js`)
const isDirectExecution = process.argv[1] && process.argv[1].endsWith('index.js');
if (isDirectExecution) {
  startServer().catch((err) => {
    console.error('[index.js] Failed to launch server:', err.message);
  });
}

export default app;
