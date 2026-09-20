/**
 * Automated Verification Suite for SDN302 Lab 03 (Express.js)
 * Tests Requirements 1, 2, 3, and 4 against a live server instance.
 */

import http from 'http';
import app from './lab03-express/index.js';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'booknest-secret-key-2026';

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
  const response = await fetch(url, options);
  let json = null;
  let text = '';
  try {
    const cloned = response.clone();
    json = await cloned.json();
  } catch {
    text = await response.text();
  }
  return { status: response.status, headers: response.headers, json, text };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  STARTING AUTOMATED VERIFICATION FOR SDN302 LAB 03');
  console.log('======================================================\n');

  // --- Requirement 1: Create and configure Express app ---
  console.log('\x1b[36m[Requirement 1: Express App Configuration & Base Routes]\x1b[0m');
  
  const rootRes = await request('/');
  assert(rootRes.status === 200, 'GET / returns HTTP 200 OK');
  assert(
    rootRes.json && rootRes.json.success === true && typeof rootRes.json.message === 'string',
    'GET / returns welcome message and JSON index'
  );

  const healthRes = await request('/health');
  assert(healthRes.status === 200, 'GET /health returns HTTP 200 OK');
  assert(
    healthRes.json && healthRes.json.status === 'OK' && typeof healthRes.json.uptime === 'number',
    'GET /health returns { status: "OK", uptime }'
  );

  // --- Requirement 3: Middleware & Security ---
  console.log('\n\x1b[36m[Requirement 3: Built-in, Third-Party & Custom Middleware]\x1b[0m');

  const missingKeyRes = await request('/api/books');
  assert(
    missingKeyRes.status === 401,
    'GET /api/books without x-api-key header returns 401 Unauthorized'
  );
  assert(
    missingKeyRes.json && missingKeyRes.json.error === 'Unauthorized',
    'Response informs missing x-api-key header'
  );

  const invalidKeyRes = await request('/api/books', {
    headers: { 'x-api-key': 'incorrect-token' }
  });
  assert(
    invalidKeyRes.status === 401,
    'GET /api/books with invalid x-api-key returns 401 Unauthorized'
  );

  const staticHtmlRes = await request('/index.html');
  assert(staticHtmlRes.status === 200, 'GET /index.html served by express.static() (HTTP 200)');
  assert(staticHtmlRes.text.includes('BookNest'), 'Static HTML contains BookNest title');

  const staticCssRes = await request('/style.css');
  assert(staticCssRes.status === 200, 'GET /style.css served by express.static() (HTTP 200)');

  // --- Requirement 2: RESTful routing with express.Router ---
  console.log('\n\x1b[36m[Requirement 2: RESTful Routing for /api/books]\x1b[0m');

  const listRes = await request('/api/books', {
    headers: { 'x-api-key': API_KEY }
  });
  assert(listRes.status === 200, 'GET /api/books with valid API key returns HTTP 200');
  assert(
    listRes.json && Array.isArray(listRes.json.data) && listRes.json.data.length > 0,
    'GET /api/books returns non-empty in-memory array'
  );

  const getOneRes = await request('/api/books/1', {
    headers: { 'x-api-key': API_KEY }
  });
  assert(getOneRes.status === 200, 'GET /api/books/1 returns HTTP 200');
  assert(getOneRes.json && getOneRes.json.data.id === 1, 'GET /api/books/1 returns correct book ID');

  const getNotFoundRes = await request('/api/books/99999', {
    headers: { 'x-api-key': API_KEY }
  });
  assert(getNotFoundRes.status === 404, 'GET /api/books/99999 returns HTTP 404 Not Found');

  // POST create book
  const newBookPayload = {
    title: 'Automated Test Book',
    author: 'SDN302 Test Runner',
    category: 'IT',
    price: 29.99,
    stock: 50
  };
  const createRes = await request('/api/books', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newBookPayload)
  });
  assert(createRes.status === 201, 'POST /api/books returns HTTP 201 Created');
  assert(
    createRes.json && typeof createRes.json.data.id === 'number',
    'POST /api/books generates identifier automatically'
  );
  const createdId = createRes.json ? createRes.json.data.id : null;

  // PUT update book
  if (createdId) {
    const updateRes = await request(`/api/books/${createdId}`, {
      method: 'PUT',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Updated Automated Test Book',
        price: 34.99
      })
    });
    assert(updateRes.status === 200, `PUT /api/books/${createdId} returns HTTP 200 OK`);
    assert(
      updateRes.json && updateRes.json.data.title === 'Updated Automated Test Book',
      'PUT updates specified book fields correctly'
    );
  }

  // DELETE book
  if (createdId) {
    const deleteRes = await request(`/api/books/${createdId}`, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY }
    });
    assert(deleteRes.status === 200, `DELETE /api/books/${createdId} returns HTTP 200 OK`);

    const recheckRes = await request(`/api/books/${createdId}`, {
      headers: { 'x-api-key': API_KEY }
    });
    assert(recheckRes.status === 404, 'GET deleted book returns HTTP 404 Not Found');
  }

  // --- Requirement 4: Validation and Error Handling ---
  console.log('\n\x1b[36m[Requirement 4: Validation & Central Error Handling]\x1b[0m');

  const missingTitleRes = await request('/api/books', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: 20, category: 'IT' })
  });
  assert(
    missingTitleRes.status === 400,
    'POST /api/books missing title returns HTTP 400 Bad Request'
  );

  const negativePriceRes = await request('/api/books', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Negative Price Book', price: -15, category: 'IT' })
  });
  assert(
    negativePriceRes.status === 400,
    'POST /api/books with negative price returns HTTP 400 Bad Request'
  );

  const invalidCategoryRes = await request('/api/books', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Invalid Category Book', price: 25, category: 'Cooking' })
  });
  assert(
    invalidCategoryRes.status === 400,
    'POST /api/books with invalid category returns HTTP 400 Bad Request'
  );

  const errorRouteRes = await request('/api/books/error-test', {
    headers: { 'x-api-key': API_KEY }
  });
  assert(
    errorRouteRes.status === 500,
    'GET /api/books/error-test triggers Central Error Handler with HTTP 500'
  );
  assert(
    errorRouteRes.json && errorRouteRes.json.success === false,
    'Central error response formats consistent uniform JSON'
  );

  const unknownRouteRes = await request('/completely/unknown/endpoint');
  assert(
    unknownRouteRes.status === 404,
    'Unknown route catches 404 middleware with HTTP 404 Not Found'
  );

  // --- Summary ---
  console.log('\n======================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  return failed === 0;
}

// Check if server is already running or start a temporary test server
async function startVerification() {
  let isExternalServer = false;
  try {
    const probeRes = await fetch(`${BASE_URL}/health`);
    if (probeRes.ok) {
      isExternalServer = true;
      console.log(`[Info] Detected active server running on ${BASE_URL}. Executing tests against live instance...`);
    }
  } catch {
    isExternalServer = false;
  }

  if (isExternalServer) {
    const success = await runTests();
    process.exit(success ? 0 : 1);
  } else {
    const server = http.createServer(app);
    server.listen(PORT, async () => {
      try {
        const success = await runTests();
        server.close(() => {
          process.exit(success ? 0 : 1);
        });
      } catch (err) {
        console.error('Test execution error:', err);
        server.close(() => {
          process.exit(1);
        });
      }
    });
  }
}

startVerification();
