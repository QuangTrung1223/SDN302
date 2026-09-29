/**
 * Comprehensive Automated Test Suite for Lab 05
 * Tests all 5 Requirements with 100% precision
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic imports of our application modules
import { connectDB, disconnectDB } from './config/db.js';
import Book from './models/Book.js';
import Category from './models/Category.js';
import app from './index.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName} ${details ? '(' + details + ')' : ''}`);
    failed++;
  }
}

async function request(serverUrl, endpoint, options = {}) {
  const url = `${serverUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
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

async function runAllTests() {
  console.log('\n================================================================');
  console.log('  🚀 BOOKNEST LAB 05 - MONGOOSE ODM TEST SUITE');
  console.log('  Student: Nguyen Le Quang Trung (DS190284)');
  console.log('================================================================\n');

  let mongod = null;
  let serverInstance = null;
  const TEST_PORT = 3200;
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // -------------------------------------------------------------
    // Requirement 1: MVC Directory Structure & Connection Setup
    // -------------------------------------------------------------
    console.log('--- [Requirement 1] MVC Folder Structure & DB Setup ---');
    const requiredFolders = ['config', 'models', 'controllers', 'routes', 'middlewares'];
    for (const folder of requiredFolders) {
      const folderPath = path.join(__dirname, folder);
      assert(fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory(), `Folder '${folder}/' exists`);
    }

    assert(fs.existsSync(path.join(__dirname, 'config', 'db.js')), "File 'config/db.js' exists");
    assert(fs.existsSync(path.join(__dirname, '.env.example')), "File '.env.example' exists");

    // Initialize in-memory MongoDB for clean, isolated, fast test execution
    console.log('\n[Test Setup] Initializing in-memory MongoDB server for testing...');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    process.env.MONGODB_URI = memoryUri;
    process.env.NODE_ENV = 'test';

    // Connect via config/db.js
    const conn = await connectDB(memoryUri);
    assert(conn && mongoose.connection.readyState === 1, 'connectDB connects successfully to MongoDB');

    // Start Express server for API integration tests
    serverInstance = app.listen(TEST_PORT);
    console.log(`[Test Setup] Test server listening on ${BASE_URL}\n`);

    // -------------------------------------------------------------
    // Requirement 2: Book Schema, 5 Types, 7 Validators, Category Model
    // -------------------------------------------------------------
    console.log('--- [Requirement 2] Book Schema & Category Model ---');
    
    // Category Model checks
    assert(Boolean(Category), 'Category model is imported and defined');
    const catSchemaPaths = Category.schema.paths;
    assert(catSchemaPaths['name'] && catSchemaPaths['name'].isRequired, 'Category schema has required name field');
    assert(catSchemaPaths['slug'], 'Category schema has slug field');
    assert(catSchemaPaths['isActive'], 'Category schema has isActive field');

    // Create a Category document
    const testCategory = await Category.create({
      name: 'Software Engineering',
      description: 'Craftsmanship, design patterns, and clean code.',
    });
    assert(testCategory && testCategory.slug === 'software-engineering', 'Category pre-save hook generated slug');

    // Book Model Schema Checks
    const bookSchema = Book.schema;
    const bookPaths = bookSchema.paths;

    // Check 5 Types: String, Number, Date, Boolean, Array
    assert(bookPaths['title'].instance === 'String', "Type 1 (String): 'title' is String");
    assert(bookPaths['price'].instance === 'Number', "Type 2 (Number): 'price' is Number");
    assert(bookPaths['publishedDate'].instance === 'Date', "Type 3 (Date): 'publishedDate' is Date");
    assert(bookPaths['inStock'].instance === 'Boolean', "Type 4 (Boolean): 'inStock' is Boolean");
    assert(bookPaths['tags'].instance === 'Array', "Type 5 (Array): 'tags' is Array");

    // Check 7 Validators:
    // 1. required
    assert(bookPaths['title'].isRequired === true, "Validator 1 (required): 'title' is required");
    // 2. default
    assert(bookPaths['inStock'].defaultValue === true, "Validator 2 (default): 'inStock' default is true");
    // 3. enum
    assert(bookPaths['category'].enumValues && bookPaths['category'].enumValues.length > 0, "Validator 3 (enum): 'category' defines enum values");
    // 4. min
    assert(bookPaths['price'].validators.some(v => v.type === 'min'), "Validator 4 (min): 'price' defines min validator");
    // 5. max
    assert(bookPaths['quantity'].validators.some(v => v.type === 'max'), "Validator 5 (max): 'quantity' defines max validator");
    // 6. minlength
    assert(bookPaths['title'].validators.some(v => v.type === 'minlength'), "Validator 6 (minlength): 'title' defines minlength validator");
    // 7. unique
    assert(bookSchema.indexes().some(([idx]) => idx.isbn === 1) || bookPaths['isbn'].options.unique === true, "Validator 7 (unique): 'isbn' defines unique index");

    // Timestamps check
    assert(bookPaths['createdAt'] && bookPaths['updatedAt'], 'Book schema has timestamps enabled (createdAt & updatedAt)');

    // Custom error messages check
    const titleMinLengthValidator = bookPaths['title'].validators.find(v => v.type === 'minlength');
    assert(titleMinLengthValidator && typeof titleMinLengthValidator.message === 'string', 'Custom error message defined for minlength validator');

    // -------------------------------------------------------------
    // Requirement 4: Custom Validation & Central Error Handling
    // -------------------------------------------------------------
    console.log('\n--- [Requirement 4] Custom Validation & Error Handling ---');

    // Custom Validator 1: publishedYear in future
    const futureBookRes = await request(BASE_URL, '/api/books', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Future Programming 2099',
        author: 'Future AI',
        isbn: '978-0132350884',
        category: 'Programming',
        price: 50,
        publishedYear: 2099, // In the future!
      }),
    });
    assert(futureBookRes.status === 400, 'Custom validator blocks future publishedYear (Status 400)');
    assert(
      futureBookRes.json && futureBookRes.json.invalidFields && futureBookRes.json.invalidFields.publishedYear,
      'Central error handler returns formatted invalidFields for publishedYear'
    );

    // Custom Validator 2: ISBN format
    const invalidIsbnRes = await request(BASE_URL, '/api/books', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Bad ISBN Book',
        author: 'John Doe',
        isbn: 'invalid-isbn-12345',
        category: 'Programming',
        price: 25,
        publishedYear: 2020,
      }),
    });
    assert(invalidIsbnRes.status === 400, 'Custom validator blocks invalid ISBN format (Status 400)');
    assert(
      invalidIsbnRes.json && invalidIsbnRes.json.invalidFields && invalidIsbnRes.json.invalidFields.isbn,
      'Central error handler returns readable error message for invalid ISBN'
    );

    // -------------------------------------------------------------
    // Requirement 5: Schema Middleware, Methods & Virtuals
    // -------------------------------------------------------------
    console.log('\n--- [Requirement 5] Schema Middleware, Methods, and Virtuals ---');

    // Test POST to create valid book and check pre-save slug generation
    const validBookRes = await request(BASE_URL, '/api/books', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category: 'Software Engineering',
        price: 37.5,
        quantity: 15,
        publishedYear: 2008,
        tags: ['clean-code', 'agile', 'refactoring'],
      }),
    });
    assert(validBookRes.status === 201, 'POST /api/books creates book successfully (Status 201)');
    const createdBook = validBookRes.json.data;
    assert(
      createdBook && createdBook.slug === 'clean-code-a-handbook-of-agile-software-craftsmanship',
      "pre('save') hook generates correct URL-friendly slug"
    );

    // Virtual property check: formattedPrice
    assert(
      createdBook && createdBook.formattedPrice === '$37.50',
      `Virtual property formattedPrice returns correct format ($37.50, got: ${createdBook?.formattedPrice})`
    );

    // Instance method test: getSummary()
    const summaryRes = await request(BASE_URL, `/api/books/${createdBook._id}/summary`);
    assert(summaryRes.status === 200, 'GET /api/books/:id/summary calls instance method (Status 200)');
    assert(
      summaryRes.json && summaryRes.json.summary && summaryRes.json.summary.includes('Robert C. Martin'),
      `Instance method returns rich summary string (${summaryRes.json?.summary})`
    );

    // Create 2nd book for static method & query testing
    const secondBookRes = await request(BASE_URL, '/api/books', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Refactoring: Improving the Design of Existing Code',
        author: 'Martin Fowler',
        isbn: '978-0134757599',
        category: 'Software Engineering',
        price: 52.0,
        quantity: 8,
        publishedYear: 2018,
        tags: ['refactoring', 'design'],
      }),
    });
    assert(secondBookRes.status === 201, 'POST /api/books creates 2nd book');

    // Static method test: findByCategory()
    const byCatRes = await request(BASE_URL, '/api/books/by-category/Software Engineering');
    assert(byCatRes.status === 200, 'GET /api/books/by-category/:category calls static method (Status 200)');
    assert(
      byCatRes.json && byCatRes.json.count === 2,
      `Static method findByCategory returns all books in category (expected: 2, got: ${byCatRes.json?.count})`
    );

    // Duplicate Key test (11000) for ISBN
    const duplicateIsbnRes = await request(BASE_URL, '/api/books', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Duplicate ISBN Book',
        author: 'Jane Doe',
        isbn: '978-0132350884', // Duplicate of Robert C. Martin book!
        category: 'Programming',
        price: 30,
      }),
    });
    assert(duplicateIsbnRes.status === 400, 'Duplicate ISBN returns 400 error via central errorHandler');
    assert(
      duplicateIsbnRes.json && duplicateIsbnRes.json.error === 'Duplicate Key Conflict',
      'Central error handler properly maps 11000 duplicate key error'
    );

    // -------------------------------------------------------------
    // Requirement 3: CRUD Operations with Mongoose Queries
    // -------------------------------------------------------------
    console.log('\n--- [Requirement 3] CRUD Operations with Mongoose Queries ---');

    // 1. getAll with find(), query, select, sort, limit
    const listRes = await request(BASE_URL, '/api/books?category=Software Engineering&select=title,price,category&sort=-price&limit=1');
    assert(listRes.status === 200, 'GET /api/books with query parameters returns 200');
    assert(listRes.json && listRes.json.data.length === 1, 'limit=1 restricts returned items to 1');
    assert(listRes.json && listRes.json.total === 2, 'Total matching count reflects total in DB');
    // Top price book should be Fowler ($52) due to sort=-price
    assert(listRes.json.data[0].price === 52, 'sort=-price sorts correctly in descending order');

    // 2. getById with valid ID
    const getByIdRes = await request(BASE_URL, `/api/books/${createdBook._id}`);
    assert(getByIdRes.status === 200, 'GET /api/books/:id with valid ObjectId returns 200');
    assert(getByIdRes.json.data.title === createdBook.title, 'Document returned matches requested ID');

    // 3. getById with invalid ObjectId (CastError check - Requirement 3 & 4)
    const invalidIdRes = await request(BASE_URL, '/api/books/invalid-id-12345');
    assert(invalidIdRes.status === 400, 'GET /api/books/:id with invalid ObjectId returns 400');
    assert(invalidIdRes.json && invalidIdRes.json.statusCode === 400, 'Response includes statusCode 400');

    // 4. getById with non-existent ObjectId (Requirement 3: 404 when document not found)
    const nonExistentId = new mongoose.Types.ObjectId();
    const notFoundRes = await request(BASE_URL, `/api/books/${nonExistentId}`);
    assert(notFoundRes.status === 404, 'GET /api/books/:id with non-existent ObjectId returns 404');

    // 5. update with findByIdAndUpdate({ new: true, runValidators: true })
    const updateRes = await request(BASE_URL, `/api/books/${createdBook._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        price: 39.99,
        quantity: 20,
      }),
    });
    assert(updateRes.status === 200, 'PUT /api/books/:id updates document (Status 200)');
    assert(
      updateRes.json.data.price === 39.99,
      "Option { new: true } returned modified document with updated price $39.99"
    );

    // Verify runValidators on update
    const invalidUpdateRes = await request(BASE_URL, `/api/books/${createdBook._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        price: -10, // Invalid min price!
      }),
    });
    assert(
      invalidUpdateRes.status === 400,
      "Option { runValidators: true } catches invalid price < 0 on update query"
    );

    // 6. remove with findByIdAndDelete
    const deleteRes = await request(BASE_URL, `/api/books/${createdBook._id}`, {
      method: 'DELETE',
    });
    assert(deleteRes.status === 200, 'DELETE /api/books/:id removes document (Status 200)');

    // Verify it is gone
    const verifyDeleted = await request(BASE_URL, `/api/books/${createdBook._id}`);
    assert(verifyDeleted.status === 404, 'Deleted document cannot be retrieved (Status 404)');

    // 404 route test
    const notFoundRouteRes = await request(BASE_URL, '/api/non-existent-endpoint');
    assert(notFoundRouteRes.status === 404, 'Undefined route triggers 404 notFoundHandler');

  } catch (error) {
    console.error('\n✖ Unexpected error during test execution:', error);
    failed++;
  } finally {
    console.log('\n[Test Teardown] Cleaning up resources...');
    if (serverInstance) {
      serverInstance.close();
    }
    await disconnectDB();
    if (mongod) {
      await mongod.stop();
    }
  }

  console.log('\n================================================================');
  console.log(`  📊 TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
