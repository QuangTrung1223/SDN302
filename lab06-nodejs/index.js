/**
 * BookNest Online Bookstore - Server Entry Point (Lab 06)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from './config/db.js';
import bookRouter from './routes/bookRouter.js';
import authorRouter from './routes/authorRouter.js';
import categoryRouter from './routes/categoryRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import requestLogger from './middlewares/logger.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsers & Logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static assets for modern Web UI
app.use(express.static(path.join(__dirname, 'public')));

// Root Endpoint: Web UI for browsers, JSON documentation for API clients
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  res.status(200).json({
    message: 'Welcome to BookNest Online Bookstore API (Lab 06 - Mongoose Population)',
    student: 'Nguyen Le Quang Trung (DS190284)',
    course: 'SDN302 - Server-side Development with NodeJS, Express and MongoDB',
    features: [
      'Two-path population with select projection (Req 2)',
      'Deep nested population: Book -> Reviews -> User (Req 3)',
      'Conditional population with match and options (Req 3)',
      'Virtual populate on Author and Category (Req 3)',
    ],
    endpoints: {
      health: 'GET /api/health',
      books: {
        listPopulated: 'GET /api/books (two-path populated: author & category)',
        listRaw: 'GET /api/books?populate=false (raw ObjectIds for comparison)',
        byIdDeep: 'GET /api/books/:id (deep nested populate: reviews -> user)',
        reviewsWithOptions: 'GET /api/books/:id/reviews?minRating=4&sort=-rating&limit=3',
        create: 'POST /api/books',
        update: 'PUT /api/books/:id',
        delete: 'DELETE /api/books/:id',
      },
      authors: {
        list: 'GET /api/authors',
        byId: 'GET /api/authors/:id (virtual populates books)',
        booksByAuthor: 'GET /api/authors/:id/books',
      },
      categories: {
        list: 'GET /api/categories',
        byId: 'GET /api/categories/:id (virtual populates books)',
        booksByCategory: 'GET /api/categories/:id/books',
      },
      reviews: {
        list: 'GET /api/reviews',
        create: 'POST /api/reviews',
      },
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    lab: 'Lab 06 - Mongoose Population',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
  });
});

// Mount Resource Routers
app.use('/api/books', bookRouter);
app.use('/api/authors', authorRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/reviews', reviewRouter);

// 404 Route Handler
app.use(notFoundHandler);

// Central Error Handler
app.use(errorHandler);

let server = null;

export const startServer = async (customPort = null) => {
  const listenPort = customPort || PORT;
  await connectDB();

  return new Promise((resolve) => {
    server = app.listen(listenPort, () => {
      console.log(`[index.js] 🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://127.0.0.1:${listenPort}`);
      resolve(server);
    });
  });
};

export const stopServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('[index.js] HTTP server stopped.');
  }
  await disconnectDB();
};

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

const isDirectExecution = process.argv[1] && process.argv[1].endsWith('index.js');
if (isDirectExecution) {
  startServer().catch((err) => {
    console.error('[index.js] Failed to launch server:', err.message);
  });
}

export default app;
