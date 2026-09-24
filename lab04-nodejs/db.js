/**
 * MongoDB Connection Module using Official MongoClient (Requirement 4)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/booknest';
const DB_NAME = process.env.DB_NAME || 'booknest';

let client = null;
let db = null;
let isLiveConnection = false;

/**
 * Connect to MongoDB with MongoClient
 * @returns {Promise<Db|null>}
 */
export async function connectDB() {
  if (db && isLiveConnection) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });

    await client.connect();
    db = client.db(DB_NAME);
    isLiveConnection = true;
    console.log(`[db.js] ✔ Successfully connected to MongoDB database: '${DB_NAME}'`);
    return db;
  } catch (err) {
    isLiveConnection = false;
    db = null;
    console.log(`[db.js] ℹ Live MongoDB connection unavailable (${err.message}).`);
    console.log(`[db.js] ℹ Operating in Fallback In-Memory Mode for offline testing.`);
    return null;
  }
}

/**
 * Get the current MongoDB database instance
 * @returns {Db|null}
 */
export function getDb() {
  return db;
}

/**
 * Check if active connection to MongoDB is live
 * @returns {boolean}
 */
export function isLive() {
  return isLiveConnection;
}

/**
 * Close MongoDB connection
 */
export async function closeDB() {
  if (client) {
    try {
      await client.close();
    } catch {
      // Ignore
    }
    client = null;
    db = null;
    isLiveConnection = false;
    console.log('[db.js] MongoDB connection closed.');
  }
}

export { client };
export default getDb;
