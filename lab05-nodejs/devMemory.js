/**
 * Standalone In-Memory Dev Server for Lab 05
 * Allows full local testing and exploration even without a local MongoDB service or Atlas connection
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from './config/db.js';
import { seedDatabase } from './seed.js';
import app from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 3000;

async function startDevMemory() {
  console.log('\n===============================================================');
  console.log('  🚀 STARTING IN-MEMORY MONGOOSE DEV SERVER');
  console.log('===============================================================\n');

  console.log('[devMemory] Initializing embedded MongoDB server in RAM...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log(`[devMemory] ✔ In-Memory MongoDB running at: ${uri}`);

  // Connect Mongoose to the in-memory instance
  await connectDB(uri);

  // Seed with sample data
  console.log('[devMemory] Seeding database with initial books and categories...');
  await seedDatabase(false);

  // Start Express server
  const server = app.listen(PORT, () => {
    console.log(`\n[devMemory] 🚀 Server running at: http://127.0.0.1:${PORT}`);
    console.log('[devMemory] 📖 You can now test endpoints in your browser or Postman:');
    console.log(`  - Root API Index:       http://127.0.0.1:${PORT}/`);
    console.log(`  - All Books:            http://127.0.0.1:${PORT}/api/books`);
    console.log(`  - Filter Software Eng:  http://127.0.0.1:${PORT}/api/books?category=Software%20Engineering`);
    console.log(`  - Static Method:        http://127.0.0.1:${PORT}/api/books/by-category/Architecture`);
    console.log(`  - All Categories:       http://127.0.0.1:${PORT}/api/categories`);
    console.log('\nPress Ctrl+C to stop.\n');
  });

  const cleanup = async () => {
    console.log('\n[devMemory] Shutting down dev server...');
    server.close();
    await disconnectDB();
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startDevMemory().catch((err) => {
  console.error('[devMemory] Failed to start:', err);
  process.exit(1);
});
