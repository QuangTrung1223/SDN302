/**
 * BookNest Express.js Application Server with MongoDB Persistence (SDN302 Lab 04)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, closeDB } from './db.js';
import { customLogger } from './middlewares/logger.js';
import { notFoundHandler, centralErrorHandler } from './middlewares/errorHandler.js';
import bookRouter from './routes/bookRouter.js';

// Load environment configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Foundational Middlewares
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(customLogger);

// Serve static documentation files from public if available
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// ==========================================
// 2. Base Diagnostic Routes
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to BookNest Online Bookstore API (SDN302 Lab 04 - MongoDB Driven)!',
    documentation: {
      allBooks: 'GET /api/books?page=1&limit=10',
      searchBooks: 'GET /api/books/search?category=...&minPrice=...&maxPrice=...&keyword=...&page=1&limit=5',
      bookDetail: 'GET /api/books/:id',
      createBook: 'POST /api/books',
      updateBook: 'PUT /api/books/:id',
      deleteBook: 'DELETE /api/books/:id',
      health: 'GET /health'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 3. API Resource Routes (Requirement 4 & 5)
// ==========================================
app.use('/api/books', bookRouter);

// ==========================================
// 4. Centralized Error Handlers
// ==========================================
app.use(notFoundHandler);
app.use(centralErrorHandler);

// ==========================================
// 5. Server Initialization
// ==========================================
let server = null;

export async function startServer(port = PORT) {
  try {
    // 1. Establish connection to MongoDB (Requirement 4)
    await connectDB();

    // 2. Start HTTP listener
    return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`====================================================`);
        console.log(`  🚀 BookNest Express MongoDB Server running on port ${port}`);
        console.log(`  Local URL:   http://localhost:${port}`);
        console.log(`  Health:      http://localhost:${port}/health`);
        console.log(`  API Books:   http://localhost:${port}/api/books`);
        console.log(`  Search API:  http://localhost:${port}/api/books/search?keyword=clean`);
        console.log(`====================================================`);
        resolve(server);
      });
      server.on('error', reject);
    });
  } catch (err) {
    console.error(`[index.js] Failed to start server: ${err.message}`);
    throw err;
  }
}

export async function stopServer() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
  await closeDB();
}

// Auto-start when executed directly
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMainModule) {
  startServer().catch((err) => {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down BookNest server...');
  await stopServer();
  process.exit(0);
});

export default app;
