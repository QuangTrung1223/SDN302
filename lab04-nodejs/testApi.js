/**
 * Automated API Test Suite for Requirements 4 & 5 (Express & MongoDB)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import { startServer, stopServer } from './index.js';
import { getDb } from './db.js';

const TEST_PORT = 3100;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  let json = null;
  let text = '';
  try {
    const clone = response.clone();
    json = await clone.json();
  } catch {
    text = await response.text();
  }
  return { status: response.status, headers: response.headers, json, text };
}

async function runTests() {
  const startTime = Date.now();
  console.log('\n================================================================');
  console.log('  🚀 BOOKNEST LAB 04 - API INTEGRATION TEST SUITE (Req 4 & 5)');
  console.log('================================================================\n');

  try {
    await startServer(TEST_PORT);
  } catch (err) {
    console.error(`\x1b[31mCould not start server / connect to MongoDB:\x1b[0m ${err.message}`);
    console.log('\n----------------------------------------------------------------');
    console.log('💡 HINT:');
    console.log('  1. Ensure MongoDB service is running or MongoDB Compass is connected.');
    console.log('  2. Or set MONGODB_URI in lab04-nodejs/.env to your MongoDB Atlas cluster URI:');
    console.log('     MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/booknest');
    console.log('----------------------------------------------------------------\n');
    process.exit(1);
  }

  let createdBookId = null;

  try {
    // -------------------------------------------------------------------------
    // 1. Diagnostics & Base Routes
    // -------------------------------------------------------------------------
    console.log('\x1b[36m[Section 1: Base Application Diagnostics]\x1b[0m');

    const rootRes = await request('/');
    assert(rootRes.status === 200, 'GET / returns HTTP 200 OK');
    assert(rootRes.json && rootRes.json.success === true, 'GET / returns success JSON with API documentation');

    const healthRes = await request('/health');
    assert(healthRes.status === 200, 'GET /health returns HTTP 200 OK');
    assert(healthRes.json && healthRes.json.status === 'OK' && healthRes.json.database === 'connected', 'GET /health verifies active database connection');

    // -------------------------------------------------------------------------
    // 2. Requirement 4: List Books & Pagination (Requirement 5)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m[Section 2: Requirement 4 & 5 - List Books & Pagination]\x1b[0m');

    const listRes = await request('/api/books?page=1&limit=5');
    assert(listRes.status === 200, 'GET /api/books returns HTTP 200 OK');
    assert(
      listRes.json &&
      typeof listRes.json.total === 'number' &&
      listRes.json.page === 1 &&
      listRes.json.limit === 5 &&
      Array.isArray(listRes.json.data),
      'GET /api/books returns envelope with total, page, limit, totalPages, and data array'
    );

    // -------------------------------------------------------------------------
    // 3. Requirement 4: Create Book (POST /api/books)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m[Section 3: Requirement 4 - Create Book with Driver API]\x1b[0m');

    const newBookPayload = {
      title: "Test Automation in Node.js & MongoDB",
      price: 29.99,
      quantity: 15,
      publishedYear: 2026,
      category: "Software Engineering",
      tags: ["testing", "nodejs", "mongodb", "tdd"]
    };

    const createRes = await request('/api/books', {
      method: 'POST',
      body: JSON.stringify(newBookPayload)
    });

    assert(createRes.status === 201, 'POST /api/books returns HTTP 201 Created');
    assert(
      createRes.json && createRes.json.success === true && createRes.json.data && createRes.json.data._id,
      'POST /api/books returns newly inserted document with MongoDB generated _id'
    );

    createdBookId = createRes.json?.data?._id;

    // Validation check on POST
    const invalidCreateRes = await request('/api/books', {
      method: 'POST',
      body: JSON.stringify({ price: -10 })
    });
    assert(invalidCreateRes.status === 400, 'POST /api/books rejects invalid payload with HTTP 400 Bad Request');

    // -------------------------------------------------------------------------
    // 4. Requirement 4: Get Book By ID (GET /api/books/:id)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m[Section 4: Requirement 4 - Get Book by ObjectId]\x1b[0m');

    if (createdBookId) {
      const getByIdRes = await request(`/api/books/${createdBookId}`);
      assert(getByIdRes.status === 200, `GET /api/books/${createdBookId} returns HTTP 200 OK`);
      assert(
        getByIdRes.json && getByIdRes.json.data?.title === newBookPayload.title,
        'GET /api/books/:id matches title of created book'
      );
    }

    const invalidIdRes = await request('/api/books/invalid-id-xyz');
    assert(invalidIdRes.status === 400, 'GET /api/books/invalid-id rejects malformed ObjectId with HTTP 400');

    const notFoundId = '660000000000000000000999';
    const notFoundRes = await request(`/api/books/${notFoundId}`);
    assert(notFoundRes.status === 404, 'GET /api/books/:id returns HTTP 404 when document does not exist');

    // -------------------------------------------------------------------------
    // 5. Requirement 4: Update Book (PUT /api/books/:id)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m[Section 5: Requirement 4 - Update Book with Driver API]\x1b[0m');

    if (createdBookId) {
      const updatePayload = {
        price: 34.50,
        quantity: 20
      };

      const updateRes = await request(`/api/books/${createdBookId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload)
      });

      assert(updateRes.status === 200, `PUT /api/books/${createdBookId} returns HTTP 200 OK`);
      assert(
        updateRes.json && updateRes.json.data?.price === 34.50 && updateRes.json.data?.quantity === 20,
        'PUT /api/books/:id successfully updates price and quantity in MongoDB'
      );
    }

    // -------------------------------------------------------------------------
    // 6. Requirement 5: Advanced Search Endpoint
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m[Section 6: Requirement 5 - Advanced Search Endpoint with Filtering & Pagination]\x1b[0m');

    // Search by keyword
    const searchKeywordRes = await request('/api/books/search?keyword=clean');
    assert(searchKeywordRes.status === 200, 'GET /api/books/search?keyword=clean returns HTTP 200 OK');
    assert(
      searchKeywordRes.json && searchKeywordRes.json.data.length > 0 &&
      searchKeywordRes.json.data.every(b => /clean/i.test(b.title) || b.tags?.some(t => /clean/i.test(t))),
      'Search by keyword: matches books with keyword in title or tags'
    );

    // Search by category and price range
    const searchFilteredRes = await request('/api/books/search?category=Software%20Engineering&minPrice=30&maxPrice=50&page=1&limit=3');
    assert(searchFilteredRes.status === 200, 'GET /api/books/search with category and price range returns HTTP 200 OK');
    assert(
      searchFilteredRes.json &&
      typeof searchFilteredRes.json.total === 'number' &&
      searchFilteredRes.json.page === 1 &&
      searchFilteredRes.json.limit === 3 &&
      searchFilteredRes.json.data.every(b => b.price >= 30 && b.price <= 50),
      'Search with price range: correctly bounds price >= 30 and price <= 50'
    );

    // -------------------------------------------------------------------------
    // 7. Requirement 4: Delete Book (DELETE /api/books/:id)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m[Section 7: Requirement 4 - Delete Book with Driver API]\x1b[0m');

    if (createdBookId) {
      const deleteRes = await request(`/api/books/${createdBookId}`, {
        method: 'DELETE'
      });
      assert(deleteRes.status === 200, `DELETE /api/books/${createdBookId} returns HTTP 200 OK`);

      const verifyDeletedRes = await request(`/api/books/${createdBookId}`);
      assert(verifyDeletedRes.status === 404, 'Subsequent GET after DELETE returns HTTP 404 Not Found');
    }

    // -------------------------------------------------------------------------
    // 8. Requirement 5: Error Handling
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m[Section 8: Requirement 5 - Error Handling & 404/500 Responses]\x1b[0m');

    const unknownRouteRes = await request('/api/unknown-endpoint-xyz');
    assert(unknownRouteRes.status === 404, 'Unknown route returns structured HTTP 404 JSON');

    // -------------------------------------------------------------------------
    // Summary Scorecard
    // -------------------------------------------------------------------------
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n================================================================');
    console.log(`  INTEGRATION TEST RESULTS: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m (${duration}s)`);
    console.log('================================================================\n');

    if (failed === 0) {
      console.log('  \x1b[32m🎉 ALL REQUIREMENTS (4 & 5) VERIFIED SUCCESSFULLY!\x1b[0m\n');
    } else {
      console.log('  \x1b[31m⚠️ SOME CHECKS FAILED. Review output above.\x1b[0m\n');
      process.exitCode = 1;
    }
  } finally {
    await stopServer();
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
