/**
 * Database Connection Module using Mongoose ODM (Lab 06)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/booknest_population';

/**
 * Connect to MongoDB using Mongoose
 * @param {string} [customUri] - Optional override URI (used for testing or in-memory)
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async (customUri = null) => {
  const uri = customUri || MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[db.js] ✔ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[db.js] ✖ MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'test' || process.env.DONT_EXIT_ON_DB_FAIL === 'true') {
      throw error;
    }

    console.error('[db.js] Exiting application gracefully due to database connection failure...');
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[db.js] MongoDB disconnected cleanly.');
  } catch (error) {
    console.error(`[db.js] Error while disconnecting: ${error.message}`);
  }
};

export default connectDB;
