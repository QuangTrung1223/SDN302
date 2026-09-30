/**
 * Automated Verification Test Suite for Lab 06
 * Tests all requirements: References, Multi-path Population, Deep Population, Match, Options, Virtual Populate
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { connectDB, disconnectDB } from './config/db.js';
import Author from './models/Author.js';
import Category from './models/Category.js';
import User from './models/User.js';
import Book from './models/Book.js';
import Review from './models/Review.js';
import { seedDatabase } from './seed.js';
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

async function request(baseUrl, endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  let json = null;
  let text = '';
  try {
    const clone = res.clone();
    json = await clone.json();
  } catch {
    text = await res.text();
  }
  return { status: res.status, headers: res.headers, json, text };
}

async function runTests() {
  console.log('\n================================================================');
  console.log('  🚀 BOOKNEST LAB 06 - MONGOOSE POPULATION TEST SUITE');
  console.log('  Student: Nguyen Le Quang Trung (DS190284)');
  console.log('================================================================\n');

  let mongod = null;
  let serverInstance = null;
  const TEST_PORT = 3300;
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // -------------------------------------------------------------
    // Setup In-Memory MongoDB & Seed Data
    // -------------------------------------------------------------
    console.log('[Test Setup] Starting In-Memory MongoDB server...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    process.env.NODE_ENV = 'test';

    await connectDB(uri);
    await seedDatabase(false); // seed without closing connection

    serverInstance = app.listen(TEST_PORT);
    console.log(`[Test Setup] Express test server listening on ${BASE_URL}\n`);

    // -------------------------------------------------------------
    // Requirement 1: Design & Implement Related Models
    // -------------------------------------------------------------
    console.log('--- [Requirement 1] Model Design & Schema References ---');

    // 1. Author Model verification
    assert(Boolean(Author), 'Author model is defined and loaded');
    assert(Author.schema.paths.name.isRequired, 'Author schema has required name field');

    // 2. Category Model verification
    assert(Boolean(Category), 'Category model is defined and loaded');
    assert(Category.schema.paths.name.isRequired, 'Category schema has required name field');

    // 3. User Model verification
    assert(Boolean(User), 'User model is defined and loaded');
    assert(User.schema.paths.username.isRequired, 'User schema has required username field');

    // 4. Book Model references Author and Category via ObjectId & ref
    const bookPaths = Book.schema.paths;
    assert(
      bookPaths['author'].instance.toLowerCase() === 'objectid' && bookPaths['author'].options.ref === 'Author',
      "Book schema references Author model via ObjectId and ref: 'Author'"
    );
    assert(
      bookPaths['category'].instance.toLowerCase() === 'objectid' && bookPaths['category'].options.ref === 'Category',
      "Book schema references Category model via ObjectId and ref: 'Category'"
    );

    // 5. Review Model references Book and User
    const reviewPaths = Review.schema.paths;
    assert(
      reviewPaths['book'].instance.toLowerCase() === 'objectid' && reviewPaths['book'].options.ref === 'Book',
      "Review schema references Book model via ObjectId and ref: 'Book'"
    );
    assert(
      reviewPaths['user'].instance.toLowerCase() === 'objectid' && reviewPaths['user'].options.ref === 'User',
      "Review schema references User model via ObjectId and ref: 'User'"
    );

    // -------------------------------------------------------------
    // Requirement 2: Populate References in Queries
    // -------------------------------------------------------------
    console.log('\n--- [Requirement 2] Populate References & Select Projection ---');

    // Test 1: GET /api/books (default populated: two paths author & category)
    const popRes = await request(BASE_URL, '/api/books');
    assert(popRes.status === 200, 'GET /api/books returns 200 OK');
    assert(popRes.json.isPopulated === true, 'Response flags isPopulated: true');
    assert(popRes.json.data.length > 0, 'Books list contains seeded books');

    const firstBookPop = popRes.json.data[0];
    assert(
      typeof firstBookPop.author === 'object' && Boolean(firstBookPop.author.name),
      `Author reference is populated as object with name: "${firstBookPop.author?.name}"`
    );
    assert(
      typeof firstBookPop.category === 'object' && Boolean(firstBookPop.category.name),
      `Category reference is populated as object with name: "${firstBookPop.category?.name}"`
    );

    // Test 2: Select projection verification (author select: 'name bio nationality')
    assert(
      firstBookPop.author.name && firstBookPop.author.nationality !== undefined,
      'Populated author includes selected fields (name, nationality)'
    );
    assert(
      firstBookPop.author.birthYear === undefined,
      'Populated author excludes unselected fields (birthYear omitted by select)'
    );

    // Test 3: Compare JSON output before and after population
    const unpopRes = await request(BASE_URL, '/api/books?populate=false');
    assert(unpopRes.status === 200, 'GET /api/books?populate=false returns 200 OK');
    const firstBookUnpop = unpopRes.json.data[0];
    assert(
      typeof firstBookUnpop.author === 'string' && firstBookUnpop.author.length === 24,
      `Before population: author is raw 24-character hexadecimal ObjectId ('${firstBookUnpop.author}')`
    );
    assert(
      typeof firstBookPop.author === 'object' && firstBookPop.author._id === firstBookUnpop.author,
      'After population: author is hydrated document whose _id matches raw ObjectId'
    );

    // -------------------------------------------------------------
    // Requirement 3: Advanced Population Options
    // -------------------------------------------------------------
    console.log('\n--- [Requirement 3] Deep Population, Match, Options & Virtual Populate ---');

    // Test 1: Deep Nested Population: Book -> Reviews -> User
    const cleanCodeDoc = await Book.findOne({ title: /Clean Code/i });
    assert(Boolean(cleanCodeDoc), 'Found Clean Code book in test database');

    const deepRes = await request(BASE_URL, `/api/books/${cleanCodeDoc._id}`);
    assert(deepRes.status === 200, 'GET /api/books/:id returns 200 OK');
    const deepBook = deepRes.json.data;

    assert(
      Array.isArray(deepBook.reviews) && deepBook.reviews.length > 0,
      `Virtual reviews populated on Book (found ${deepBook.reviews?.length} reviews)`
    );

    const firstReview = deepBook.reviews[0];
    assert(
      typeof firstReview.user === 'object' && Boolean(firstReview.user.username),
      `Deep Population verified: Review.user is populated with username: "${firstReview.user?.username}"`
    );
    assert(
      firstReview.user.avatar !== undefined,
      'Deep Population verified: Review.user includes avatar'
    );

    // Test 2: Conditional Population using `match` option
    // Clean Code has three reviews: ratings 5, 4, and 2.
    // Filtering by minRating=4 should only populate the 5 and 4 star reviews, excluding the 2-star review.
    const matchRes = await request(BASE_URL, `/api/books/${cleanCodeDoc._id}/reviews?minRating=4`);
    assert(matchRes.status === 200, 'GET /api/books/:id/reviews?minRating=4 returns 200 OK');
    assert(matchRes.json.reviewCount === 2, `match option filtered reviews to >= 4 stars (expected 2, got: ${matchRes.json.reviewCount})`);
    assert(
      matchRes.json.data.every((r) => r.rating >= 4),
      'All populated reviews strictly satisfy the match condition (rating >= 4)'
    );

    // Test 3: Population with `options` (sort and limit)
    // Querying with sort=-rating and limit=1 should return exactly 1 review with rating 5.
    const optionsRes = await request(BASE_URL, `/api/books/${cleanCodeDoc._id}/reviews?sort=-rating&limit=1`);
    assert(optionsRes.status === 200, 'GET /api/books/:id/reviews with options returns 200 OK');
    assert(optionsRes.json.data.length === 1, 'options.limit=1 successfully restricted result count to 1');
    assert(optionsRes.json.data[0].rating === 5, 'options.sort=-rating ordered highest rating first (rating: 5)');

    // Test 4: Virtual Populate on Author Model
    const uncleBobDoc = await Author.findOne({ name: /Robert C. Martin/i });
    assert(Boolean(uncleBobDoc), 'Found Robert C. Martin author in test database');

    const authorVirtualRes = await request(BASE_URL, `/api/authors/${uncleBobDoc._id}/books`);
    assert(authorVirtualRes.status === 200, 'GET /api/authors/:id/books returns 200 OK');
    assert(
      authorVirtualRes.json.totalBooks >= 2,
      `Virtual Populate on Author: author.books populated ${authorVirtualRes.json.totalBooks} written books`
    );
    assert(
      authorVirtualRes.json.data.some((b) => b.title.includes('Clean Code')),
      'Author books array contains Clean Code'
    );

    // Test 5: Virtual Populate on Category Model
    const softEngCat = await Category.findOne({ name: /Software Engineering/i });
    assert(Boolean(softEngCat), 'Found Software Engineering category in test database');

    const catVirtualRes = await request(BASE_URL, `/api/categories/${softEngCat._id}/books`);
    assert(catVirtualRes.status === 200, 'GET /api/categories/:id/books returns 200 OK');
    assert(
      catVirtualRes.json.totalBooks >= 3,
      `Virtual Populate on Category: category.books populated ${catVirtualRes.json.totalBooks} books`
    );

  } catch (error) {
    console.error('\n✖ Unexpected error during test execution:', error);
    failed++;
  } finally {
    console.log('\n[Test Teardown] Cleaning up resources...');
    if (serverInstance) serverInstance.close();
    await disconnectDB();
    if (mongod) await mongod.stop();
  }

  console.log('\n================================================================');
  console.log(`  📊 LAB 06 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests();
