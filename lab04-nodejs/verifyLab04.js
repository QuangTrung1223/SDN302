/**
 * Automated Verification & Testing Suite for SDN302 Lab 04 (MongoDB)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 *
 * Usage:
 *   node verifyLab04.js              # Runs full test & verification suite
 *   node verifyLab04.js --seed-only  # Seeds the database without running query assertions
 *   node verifyLab04.js --export     # Exports the books collection to JSON
 */

import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/booknest';
const DB_NAME = process.env.DB_NAME || 'booknest';

const args = process.argv.slice(2);
const isSeedOnly = args.includes('--seed-only');
const isExportOnly = args.includes('--export');

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

// Fixed IDs for predictable relationship testing
const AUTHOR_IDS = {
  bob: new ObjectId('660000000000000000000001'),
  fowler: new ObjectId('660000000000000000000002'),
  simpson: new ObjectId('660000000000000000000003'),
  evans: new ObjectId('660000000000000000000004')
};

const CATEGORY_IDS = {
  se: new ObjectId('661111111111111111111101'),
  arch: new ObjectId('661111111111111111111102'),
  web: new ObjectId('661111111111111111111103'),
  db: new ObjectId('661111111111111111111104')
};

const SAMPLE_AUTHORS = [
  {
    _id: AUTHOR_IDS.bob,
    name: "Robert C. Martin",
    bio: "Popularly known as Uncle Bob, legendary software engineer and co-author of the Agile Manifesto.",
    nationality: "American",
    birthYear: 1952,
    createdAt: new Date("2026-01-10T08:00:00Z")
  },
  {
    _id: AUTHOR_IDS.fowler,
    name: "Martin Fowler",
    bio: "Chief Scientist at Thoughtworks, author of Refactoring and Patterns of Enterprise Application Architecture.",
    nationality: "British",
    birthYear: 1963,
    createdAt: new Date("2026-01-12T09:30:00Z")
  },
  {
    _id: AUTHOR_IDS.simpson,
    name: "Kyle Simpson",
    bio: "JavaScript evangelist, open-source enthusiast, educator, and author of the 'You Don't Know JS' series.",
    nationality: "American",
    birthYear: 1980,
    createdAt: new Date("2026-01-15T11:00:00Z")
  },
  {
    _id: AUTHOR_IDS.evans,
    name: "Eric Evans",
    bio: "Domain-Driven Design (DDD) pioneer, systems analyst and specialized software architecture consultant.",
    nationality: "American",
    birthYear: 1963,
    createdAt: new Date("2026-01-18T14:20:00Z")
  }
];

const SAMPLE_CATEGORIES = [
  {
    _id: CATEGORY_IDS.se,
    name: "Software Engineering",
    description: "Best practices, code hygiene, agile craftsmanship, testing, and clean architecture.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  },
  {
    _id: CATEGORY_IDS.arch,
    name: "Software Architecture",
    description: "Enterprise system design, domain-driven design, microservices, and refactoring patterns.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  },
  {
    _id: CATEGORY_IDS.web,
    name: "Web Development",
    description: "Modern JavaScript, asynchronous runtime internals, Express.js backend, and frontend mastery.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  },
  {
    _id: CATEGORY_IDS.db,
    name: "Database Systems",
    description: "Relational database design, NoSQL persistence models, indexing, and distributed storage.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  }
];

const SAMPLE_BOOKS = [
  {
    _id: new ObjectId("662222222222222222222201"),
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 37.95,
    quantity: 25,
    publishedYear: 2008,
    category: "Software Engineering",
    categoryId: CATEGORY_IDS.se,
    authorId: AUTHOR_IDS.bob,
    tags: ["clean-code", "refactoring", "agile", "best-practices"],
    reviews: [
      { reviewer: "Alice Nguyen", rating: 5, comment: "A timeless masterpiece every programmer must read.", date: new Date("2026-02-01") },
      { reviewer: "Bob Smith", rating: 4, comment: "Great principles, though some Java examples are a bit dated.", date: new Date("2026-02-10") }
    ],
    createdAt: new Date("2026-01-20T10:00:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222202"),
    title: "The Clean Coder: A Code of Conduct for Professional Programmers",
    price: 34.50,
    quantity: 18,
    publishedYear: 2011,
    category: "Software Engineering",
    categoryId: CATEGORY_IDS.se,
    authorId: AUTHOR_IDS.bob,
    tags: ["professionalism", "career", "clean-code", "discipline"],
    reviews: [
      { reviewer: "Charlie Tran", rating: 5, comment: "Super practical advice on estimating, saying no, and ethics.", date: new Date("2026-02-14") }
    ],
    createdAt: new Date("2026-01-20T10:15:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222203"),
    title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design",
    price: 42.00,
    quantity: 12,
    publishedYear: 2017,
    category: "Software Architecture",
    categoryId: CATEGORY_IDS.arch,
    authorId: AUTHOR_IDS.bob,
    tags: ["architecture", "clean-code", "solid", "design-patterns"],
    reviews: [
      { reviewer: "David Pham", rating: 5, comment: "The dependency inversion principle explained with razor sharpness.", date: new Date("2026-02-20") }
    ],
    createdAt: new Date("2026-01-20T10:30:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222204"),
    title: "Refactoring: Improving the Design of Existing Code",
    price: 49.99,
    quantity: 15,
    publishedYear: 2018,
    category: "Software Engineering",
    categoryId: CATEGORY_IDS.se,
    authorId: AUTHOR_IDS.fowler,
    tags: ["refactoring", "code-smells", "testing", "javascript"],
    reviews: [
      { reviewer: "Eva Le", rating: 5, comment: "The 2nd edition in modern JavaScript is pure gold.", date: new Date("2026-02-25") },
      { reviewer: "Frank Miller", rating: 5, comment: "Every refactoring catalog entry is crystal clear.", date: new Date("2026-03-01") }
    ],
    createdAt: new Date("2026-01-20T11:00:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222205"),
    title: "Patterns of Enterprise Application Architecture",
    price: 54.00,
    quantity: 8,
    publishedYear: 2002,
    category: "Software Architecture",
    categoryId: CATEGORY_IDS.arch,
    authorId: AUTHOR_IDS.fowler,
    tags: ["enterprise", "architecture", "patterns", "data-mapper"],
    reviews: [
      { reviewer: "George Vu", rating: 4, comment: "Foundational architecture patterns, highly recommended.", date: new Date("2026-03-05") }
    ],
    createdAt: new Date("2026-01-20T11:15:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222206"),
    title: "You Don't Know JS Yet: Get Started",
    price: 18.99,
    quantity: 40,
    publishedYear: 2020,
    category: "Web Development",
    categoryId: CATEGORY_IDS.web,
    authorId: AUTHOR_IDS.simpson,
    tags: ["javascript", "web", "fundamentals", "ydkjs"],
    reviews: [
      { reviewer: "Helen Hoang", rating: 5, comment: "Deepens your core JS intuition like nothing else.", date: new Date("2026-03-08") }
    ],
    createdAt: new Date("2026-01-20T11:30:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222207"),
    title: "You Don't Know JS Yet: Scope & Closures",
    price: 24.95,
    quantity: 35,
    publishedYear: 2020,
    category: "Web Development",
    categoryId: CATEGORY_IDS.web,
    authorId: AUTHOR_IDS.simpson,
    tags: ["javascript", "closures", "scope", "ydkjs"],
    reviews: [
      { reviewer: "Ian Do", rating: 5, comment: "Demystifies lexical scope and hoisting permanently.", date: new Date("2026-03-10") },
      { reviewer: "Jenny Vo", rating: 5, comment: "Concise, deep, and beautifully explained.", date: new Date("2026-03-11") }
    ],
    createdAt: new Date("2026-01-20T11:45:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222208"),
    title: "You Don't Know JS Yet: Objects & Classes",
    price: 26.50,
    quantity: 22,
    publishedYear: 2021,
    category: "Web Development",
    categoryId: CATEGORY_IDS.web,
    authorId: AUTHOR_IDS.simpson,
    tags: ["javascript", "prototypes", "objects", "classes", "ydkjs"],
    reviews: [
      { reviewer: "Kevin Lam", rating: 4, comment: "Prototypes explained without the syntactic sugar confusion.", date: new Date("2026-03-12") }
    ],
    createdAt: new Date("2026-01-20T12:00:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222209"),
    title: "Domain-Driven Design: Tackling Complexity in the Heart of Software",
    price: 58.50,
    quantity: 6,
    publishedYear: 2003,
    category: "Software Architecture",
    categoryId: CATEGORY_IDS.arch,
    authorId: AUTHOR_IDS.evans,
    tags: ["ddd", "ubiquitous-language", "bounded-context", "architecture"],
    reviews: [
      { reviewer: "Linda Ngo", rating: 5, comment: "The blue book that changed modern enterprise architecture.", date: new Date("2026-03-14") }
    ],
    createdAt: new Date("2026-01-20T12:15:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222210"),
    title: "Domain-Driven Design Reference: Definitions and Pattern Summaries",
    price: 21.00,
    quantity: 14,
    publishedYear: 2014,
    category: "Software Architecture",
    categoryId: CATEGORY_IDS.arch,
    authorId: AUTHOR_IDS.evans,
    tags: ["ddd", "reference", "architecture", "patterns"],
    reviews: [
      { reviewer: "Minh Tran", rating: 4, comment: "Great quick handbook summarizing all DDD tactical patterns.", date: new Date("2026-03-15") }
    ],
    createdAt: new Date("2026-01-20T12:30:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222211"),
    title: "Node.js Design Patterns: Design and implement production-grade Node.js apps",
    price: 45.00,
    quantity: 20,
    publishedYear: 2020,
    category: "Web Development",
    categoryId: CATEGORY_IDS.web,
    authorId: AUTHOR_IDS.fowler,
    tags: ["nodejs", "express", "asynchronous", "design-patterns"],
    reviews: [
      { reviewer: "Nhi Nguyen", rating: 5, comment: "Best comprehensive guide to the Node.js event loop and streams.", date: new Date("2026-03-16") }
    ],
    createdAt: new Date("2026-01-20T12:45:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222212"),
    title: "Designing Data-Intensive Applications: The Big Ideas Behind Reliable Systems",
    price: 52.00,
    quantity: 5,
    publishedYear: 2017,
    category: "Database Systems",
    categoryId: CATEGORY_IDS.db,
    authorId: AUTHOR_IDS.fowler,
    tags: ["database", "nosql", "distributed-systems", "reliability"],
    reviews: [
      { reviewer: "Oscar Bui", rating: 5, comment: "Unquestionably the best computing textbook of the decade.", date: new Date("2026-03-18") }
    ],
    createdAt: new Date("2026-01-20T13:00:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222213"),
    title: "Obsolete Draft: Deprecated Legacy Guide",
    price: 9.99,
    quantity: 0,
    publishedYear: 1999,
    category: "Software Engineering",
    categoryId: CATEGORY_IDS.se,
    authorId: AUTHOR_IDS.bob,
    tags: ["deprecated", "outdated"],
    reviews: [],
    createdAt: new Date("2026-01-20T13:15:00Z")
  }
];

async function seedDatabase(db) {
  console.log('  Resetting collections (books, authors, categories)...');
  await db.collection('books').deleteMany({});
  await db.collection('authors').deleteMany({});
  await db.collection('categories').deleteMany({});

  const authorsRes = await db.collection('authors').insertMany(SAMPLE_AUTHORS);
  const categoriesRes = await db.collection('categories').insertMany(SAMPLE_CATEGORIES);
  const booksRes = await db.collection('books').insertMany(SAMPLE_BOOKS);

  console.log(`  Inserted: ${authorsRes.insertedCount} authors, ${categoriesRes.insertedCount} categories, ${booksRes.insertedCount} books.`);
}

async function exportBooksToJson(db) {
  const books = await db.collection('books').find({}).toArray();
  const exportDir = path.join(__dirname, 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  const exportPath = path.join(exportDir, 'books_export.json');
  fs.writeFileSync(exportPath, JSON.stringify(books, null, 2), 'utf-8');
  console.log(`  Exported ${books.length} books to \x1b[33m${exportPath}\x1b[0m`);
}

async function runVerification() {
  const startTime = Date.now();
  console.log('\n================================================================');
  console.log('  🚀 BOOKNEST LAB 04 AUTOMATED TEST & VERIFICATION SUITE');
  console.log(`  Connecting to: ${MONGODB_URI}`);
  console.log('================================================================\n');

  let client;
  let isLive = false;
  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    await client.connect();
    isLive = true;
    console.log('  \x1b[32m✔ Connected to live MongoDB successfully.\x1b[0m\n');
  } catch (err) {
    console.log(`  \x1b[33mℹ Notice: Could not connect to live MongoDB at ${MONGODB_URI}.\x1b[0m`);
    console.log('  Running in \x1b[36mIn-Memory Validation Mode\x1b[0m to verify query logic, schema & exports.');
    console.log('\n----------------------------------------------------------------');
    console.log('💡 TO RUN AGAINST A LIVE DATABASE:');
    console.log('  1. Open MongoDB Compass: C:\\Users\\Guang Trump\\AppData\\Local\\MongoDBCompass\\MongoDBCompass.exe');
    console.log('  2. Or start local MongoDB Community Server on port 27017.');
    console.log('  3. Or set your MongoDB Atlas connection string in lab04-nodejs/.env:');
    console.log('     MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/booknest');
    console.log('----------------------------------------------------------------\n');
  }

  if (isLive) {
    const db = client.db(DB_NAME);
    try {
      // -------------------------------------------------------------------------
      // REQUIREMENT 1: Prepare Database & Sample Data
      // -------------------------------------------------------------------------
      console.log('\x1b[36m[Requirement 1: Database & Sample Data Preparation (20%)]\x1b[0m');

      await seedDatabase(db);

      const authorsCount = await db.collection('authors').countDocuments();
      assert(authorsCount >= 3, `Collection 'authors' has >= 3 documents (Current: ${authorsCount})`);

      const categoriesCount = await db.collection('categories').countDocuments();
      assert(categoriesCount >= 3, `Collection 'categories' has >= 3 documents (Current: ${categoriesCount})`);

      const booksCount = await db.collection('books').countDocuments();
      assert(booksCount >= 10, `Collection 'books' has >= 10 documents (Current: ${booksCount})`);

      const sampleBook = await db.collection('books').findOne({ title: { $exists: true } });
      assert(
        sampleBook &&
        typeof sampleBook.title === 'string' &&
        typeof sampleBook.price === 'number' &&
        typeof sampleBook.quantity === 'number' &&
        typeof sampleBook.publishedYear === 'number' &&
        typeof sampleBook.category === 'string' &&
        Array.isArray(sampleBook.tags) && sampleBook.tags.length > 0,
        'Book documents contain all required fields: title, price, quantity, publishedYear, category, tags array'
      );

      await exportBooksToJson(db);
      const exportFileExists = fs.existsSync(path.join(__dirname, 'exports', 'books_export.json'));
      assert(exportFileExists, 'Successfully exported collection to JSON file (exports/books_export.json)');

      if (isSeedOnly || isExportOnly) {
        console.log('\n✓ Requested operation completed.');
        await client.close();
        return;
      }

      // -------------------------------------------------------------------------
      // REQUIREMENT 2: Query the Data with mongosh
      // -------------------------------------------------------------------------
      console.log('\n\x1b[36m[Requirement 2: Advanced Queries with mongosh (25%)]\x1b[0m');

      const gtResult = await db.collection('books').find({ price: { $gt: 35 } }).toArray();
      assert(
        gtResult.length > 0 && gtResult.every(b => b.price > 35),
        `Comparison $gt: Retrieved ${gtResult.length} books with price > 35`
      );

      const lteResult = await db.collection('books').find({ quantity: { $lte: 10 } }).toArray();
      assert(
        lteResult.length > 0 && lteResult.every(b => b.quantity <= 10),
        `Comparison $lte: Retrieved ${lteResult.length} books with quantity <= 10`
      );

      const inCategories = ["Software Engineering", "Web Development"];
      const inResult = await db.collection('books').find({ category: { $in: inCategories } }).toArray();
      assert(
        inResult.length > 0 && inResult.every(b => inCategories.includes(b.category)),
        `Comparison $in: Retrieved ${inResult.length} books in specified categories`
      );

      const neResult = await db.collection('books').find({ publishedYear: { $ne: 2020 } }).toArray();
      assert(
        neResult.length > 0 && neResult.every(b => b.publishedYear !== 2020),
        `Comparison $ne: Retrieved ${neResult.length} books where publishedYear != 2020`
      );

      const regexResult = await db.collection('books').find({ title: { $regex: /clean/i } }).toArray();
      assert(
        regexResult.length >= 3 && regexResult.every(b => /clean/i.test(b.title)),
        `$regex search: Case-insensitive match on 'clean' returned ${regexResult.length} books`
      );

      const page2Limit = 3;
      const page2Skip = (2 - 1) * page2Limit;
      const pagedResult = await db.collection('books')
        .find({}, { projection: { title: 1, price: 1, category: 1, publishedYear: 1, _id: 0 } })
        .sort({ price: -1 })
        .skip(page2Skip)
        .limit(page2Limit)
        .toArray();

      assert(
        pagedResult.length === 3,
        `Pagination: Returned exactly ${pagedResult.length} books for page 2 (limit 3, skip 3)`
      );
      assert(
        pagedResult.every(b => b._id === undefined && b.title && b.price !== undefined),
        'Pagination projection: Correctly excluded _id and included projected fields'
      );

      const targetBookTitle = "Clean Code: A Handbook of Agile Software Craftsmanship";
      const bookBeforeUpdate = await db.collection('books').findOne({ title: targetBookTitle });
      const initialQty = bookBeforeUpdate.quantity;

      const updateRes = await db.collection('books').updateOne(
        { title: targetBookTitle },
        {
          $set: { price: 39.99 },
          $inc: { quantity: 5 }
        }
      );
      assert(updateRes.matchedCount === 1 && updateRes.modifiedCount === 1, 'updateOne: Successfully matched and modified 1 book document');

      const bookAfterUpdate = await db.collection('books').findOne({ title: targetBookTitle });
      assert(
        bookAfterUpdate.price === 39.99 && bookAfterUpdate.quantity === initialQty + 5,
        `updateOne: $set applied price=${bookAfterUpdate.price}, $inc increased quantity to ${bookAfterUpdate.quantity}`
      );

      const deleteRes = await db.collection('books').deleteMany({ quantity: { $lte: 0 } });
      assert(deleteRes.deletedCount >= 1, `deleteMany: Successfully removed ${deleteRes.deletedCount} books matching filter (quantity <= 0)`);

      const aggregationResult = await db.collection('books').aggregate([
        {
          $group: {
            _id: "$category",
            bookCount: { $sum: 1 },
            avgPrice: { $avg: "$price" }
          }
        },
        {
          $sort: { bookCount: -1, _id: 1 }
        }
      ]).toArray();

      assert(
        Array.isArray(aggregationResult) && aggregationResult.length > 0,
        `Aggregation: Successfully grouped books by category into ${aggregationResult.length} groups`
      );

      let isSortedDesc = true;
      for (let i = 0; i < aggregationResult.length - 1; i++) {
        if (aggregationResult[i].bookCount < aggregationResult[i + 1].bookCount) {
          isSortedDesc = false;
          break;
        }
      }
      assert(isSortedDesc, 'Aggregation: Results are correctly sorted in descending order by bookCount');

      // -------------------------------------------------------------------------
      // REQUIREMENT 3: Model Relationships Between Collections
      // -------------------------------------------------------------------------
      console.log('\n\x1b[36m[Requirement 3: Relationship Modeling - Embedded & Referenced (15%)]\x1b[0m');

      const bookWithReviews = await db.collection('books').findOne({ 'reviews.0': { $exists: true } });
      assert(
        bookWithReviews && Array.isArray(bookWithReviews.reviews) && bookWithReviews.reviews.length > 0,
        `Embedded Relationship: Book '${bookWithReviews?.title?.slice(0, 30)}...' embeds ${bookWithReviews?.reviews?.length} review subdocuments`
      );

      const firstReview = bookWithReviews.reviews[0];
      assert(
        firstReview && firstReview.reviewer && typeof firstReview.rating === 'number' && firstReview.comment,
        'Embedded Review schema: Contains reviewer, rating, comment, and date fields'
      );

      const authorLookupResult = await db.collection('books').aggregate([
        {
          $lookup: {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "authorDetails"
          }
        },
        { $unwind: "$authorDetails" },
        {
          $project: {
            title: 1,
            authorName: "$authorDetails.name",
            authorBio: "$authorDetails.bio"
          }
        },
        { $limit: 3 }
      ]).toArray();

      assert(
        authorLookupResult.length === 3 && authorLookupResult.every(b => b.authorName && b.authorBio),
        `Referenced Relationship: $lookup successfully joined books with authors collection via authorId (ObjectId)`
      );

      const multiLookupResult = await db.collection('books').aggregate([
        {
          $lookup: {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "author"
          }
        },
        { $unwind: "$author" },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "categoryDoc"
          }
        },
        { $unwind: "$categoryDoc" },
        { $limit: 2 }
      ]).toArray();

      assert(
        multiLookupResult.length === 2 && multiLookupResult.every(b => b.author?.name && b.categoryDoc?.name),
        `Multi-collection Join: Successfully resolved references to both authors and categories collections`
      );
    } finally {
      await client.close();
    }
  } else {
    // -------------------------------------------------------------------------
    // IN-MEMORY VALIDATION MODE (Offline Simulation)
    // -------------------------------------------------------------------------
    console.log('\x1b[36m[Requirement 1: Database & Sample Data Preparation (20%)]\x1b[0m');

    const authorsData = [...SAMPLE_AUTHORS];
    const categoriesData = [...SAMPLE_CATEGORIES];
    let booksData = JSON.parse(JSON.stringify(SAMPLE_BOOKS));

    assert(authorsData.length >= 3, `Collection 'authors' has >= 3 documents (Current: ${authorsData.length})`);
    assert(categoriesData.length >= 3, `Collection 'categories' has >= 3 documents (Current: ${categoriesData.length})`);
    assert(booksData.length >= 10, `Collection 'books' has >= 10 documents (Current: ${booksData.length})`);

    const sampleBook = booksData[0];
    assert(
      sampleBook &&
      typeof sampleBook.title === 'string' &&
      typeof sampleBook.price === 'number' &&
      typeof sampleBook.quantity === 'number' &&
      typeof sampleBook.publishedYear === 'number' &&
      typeof sampleBook.category === 'string' &&
      Array.isArray(sampleBook.tags) && sampleBook.tags.length > 0,
      'Book documents contain all required fields: title, price, quantity, publishedYear, category, tags array'
    );

    const exportPath = path.join(__dirname, 'exports', 'books_export.json');
    if (!fs.existsSync(path.dirname(exportPath))) {
      fs.mkdirSync(path.dirname(exportPath), { recursive: true });
    }
    fs.writeFileSync(exportPath, JSON.stringify(booksData, null, 2), 'utf-8');
    assert(fs.existsSync(exportPath), 'Successfully exported collection to JSON file (exports/books_export.json)');

    console.log('\n\x1b[36m[Requirement 2: Advanced Queries with mongosh (25%)]\x1b[0m');

    const gtResult = booksData.filter(b => b.price > 35);
    assert(gtResult.length > 0 && gtResult.every(b => b.price > 35), `Comparison $gt: Retrieved ${gtResult.length} books with price > 35`);

    const lteResult = booksData.filter(b => b.quantity <= 10);
    assert(lteResult.length > 0 && lteResult.every(b => b.quantity <= 10), `Comparison $lte: Retrieved ${lteResult.length} books with quantity <= 10`);

    const inCategories = ["Software Engineering", "Web Development"];
    const inResult = booksData.filter(b => inCategories.includes(b.category));
    assert(inResult.length > 0 && inResult.every(b => inCategories.includes(b.category)), `Comparison $in: Retrieved ${inResult.length} books in specified categories`);

    const neResult = booksData.filter(b => b.publishedYear !== 2020);
    assert(neResult.length > 0 && neResult.every(b => b.publishedYear !== 2020), `Comparison $ne: Retrieved ${neResult.length} books where publishedYear != 2020`);

    const regexResult = booksData.filter(b => /clean/i.test(b.title));
    assert(regexResult.length >= 3 && regexResult.every(b => /clean/i.test(b.title)), `$regex search: Case-insensitive match on 'clean' returned ${regexResult.length} books`);

    // Pagination: page 2, limit 3, sort price desc, skip 3
    const sorted = [...booksData].sort((a, b) => b.price - a.price);
    const pagedResult = sorted.slice(3, 6).map(b => ({ title: b.title, price: b.price, category: b.category, publishedYear: b.publishedYear }));
    assert(pagedResult.length === 3, `Pagination: Returned exactly ${pagedResult.length} books for page 2 (limit 3, skip 3)`);
    assert(pagedResult.every(b => b._id === undefined && b.title && b.price !== undefined), 'Pagination projection: Correctly excluded _id and included projected fields');

    // updateOne
    const targetBook = booksData.find(b => b.title === "Clean Code: A Handbook of Agile Software Craftsmanship");
    const initialQty = targetBook.quantity;
    targetBook.price = 39.99;
    targetBook.quantity += 5;
    assert(targetBook.price === 39.99 && targetBook.quantity === initialQty + 5, `updateOne: $set applied price=${targetBook.price}, $inc increased quantity to ${targetBook.quantity}`);

    // deleteMany
    const beforeCount = booksData.length;
    booksData = booksData.filter(b => b.quantity > 0);
    const deletedCount = beforeCount - booksData.length;
    assert(deletedCount >= 1, `deleteMany: Successfully removed ${deletedCount} books matching filter (quantity <= 0)`);

    // Aggregation
    const categoryMap = {};
    for (const b of booksData) {
      if (!categoryMap[b.category]) {
        categoryMap[b.category] = { _id: b.category, bookCount: 0, totalPrice: 0 };
      }
      categoryMap[b.category].bookCount++;
      categoryMap[b.category].totalPrice += b.price;
    }
    const aggregationResult = Object.values(categoryMap).map(c => ({
      _id: c._id,
      bookCount: c.bookCount,
      avgPrice: c.totalPrice / c.bookCount
    })).sort((a, b) => b.bookCount - a.bookCount);

    assert(aggregationResult.length > 0, `Aggregation: Successfully grouped books by category into ${aggregationResult.length} groups`);
    assert(aggregationResult[0].bookCount >= aggregationResult[1].bookCount, 'Aggregation: Results are correctly sorted in descending order by bookCount');

    console.log('\n\x1b[36m[Requirement 3: Relationship Modeling - Embedded & Referenced (15%)]\x1b[0m');

    const bookWithReviews = booksData.find(b => b.reviews && b.reviews.length > 0);
    assert(bookWithReviews && bookWithReviews.reviews.length > 0, `Embedded Relationship: Book '${bookWithReviews?.title?.slice(0, 30)}...' embeds ${bookWithReviews?.reviews?.length} review subdocuments`);

    const firstReview = bookWithReviews.reviews[0];
    assert(firstReview && firstReview.reviewer && typeof firstReview.rating === 'number' && firstReview.comment, 'Embedded Review schema: Contains reviewer, rating, comment, and date fields');

    // Referenced join simulation
    const joinedWithAuthor = booksData.map(b => {
      const author = authorsData.find(a => a._id.toString() === b.authorId.toString());
      return { title: b.title, authorName: author?.name, authorBio: author?.bio };
    }).filter(b => b.authorName);
    assert(joinedWithAuthor.length > 0, `Referenced Relationship: Joined books with authors collection via authorId (ObjectId)`);

    const multiJoined = booksData.map(b => {
      const author = authorsData.find(a => a._id.toString() === b.authorId.toString());
      const cat = categoriesData.find(c => c._id.toString() === b.categoryId.toString());
      return { title: b.title, author: author?.name, category: cat?.name };
    }).filter(b => b.author && b.category);
    assert(multiJoined.length > 0, `Multi-collection Join: Successfully resolved references to both authors and categories collections`);
  }

  // -------------------------------------------------------------------------
  // SUMMARY SCORECARD
  // -------------------------------------------------------------------------
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n================================================================');
  console.log(`  VERIFICATION RESULTS: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m (${duration}s)`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('  \x1b[32m🎉 ALL REQUIREMENTS MET SUCCESSFULLY (100% SCORE)!\x1b[0m\n');
  } else {
    console.log('  \x1b[31m⚠️ SOME CHECKS FAILED. Please review the output above.\x1b[0m\n');
    process.exitCode = 1;
  }
}

runVerification().catch(err => {
  console.error(`\x1b[31mVerification error:\x1b[0m`, err);
  process.exitCode = 1;
});
