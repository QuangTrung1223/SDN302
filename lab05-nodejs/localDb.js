/**
 * Local MongoDB Server Runner for Lab 05
 * Runs a real MongoDB instance on standard port 27017
 * No cloud account or password required - connects instantly with MongoDB Compass
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import { MongoMemoryServer } from 'mongodb-memory-server';

console.log('===============================================================');
console.log('  🍃 STARTING LOCAL MONGODB SERVER ON PORT 27017');
console.log('===============================================================\n');

try {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'booknest_mongoose',
    },
  });

  const uri = mongod.getUri();
  console.log(`[localDb] ✔ MongoDB Server is RUNNING at: ${uri}`);
  console.log('[localDb] 📌 HƯỚNG DẪN DÙNG VỚI MONGODB COMPASS:');
  console.log('  1. Mở MongoDB Compass -> Bấm Connect vào: mongodb://127.0.0.1:27017');
  console.log('  2. Mở một terminal mới và chạy: npm run seed');
  console.log('  3. Sau đó chạy: npm run dev');
  console.log('\n[localDb] Giữ cửa sổ terminal này chạy để duy trì database.');
  console.log('Bấm Ctrl + C nếu muốn tắt database.\n');

  const cleanup = async () => {
    console.log('\n[localDb] Stopping MongoDB server...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
} catch (error) {
  if (error.message && error.message.includes('EADDRINUSE')) {
    console.log('[localDb] ℹ Port 27017 is already in use. A MongoDB instance is already running.');
  } else {
    console.error('[localDb] ✖ Error starting MongoDB server:', error.message);
  }
}
