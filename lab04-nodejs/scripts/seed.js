/**
 * BookNest Online Bookstore - Database Seed Script
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 *
 * Usage:
 * - mongosh "mongodb://localhost:27017/booknest" scripts/seed.js
 * - Or copy/paste into MongoDB Compass embedded >_ MONGOSH tab
 */

// Switch to booknest database
const targetDb = typeof db !== 'undefined' ? db.getSiblingDB('booknest') : null;
if (!targetDb) {
  print("Error: 'db' object is not available. Please run this script in mongosh.");
}

print("=========================================================");
print("🌱 Initializing BookNest Online Bookstore Database (booknest)");
print("=========================================================");

// 1. Reset Collections (Idempotency)
print("\n[Step 1/4] Dropping existing collections if they exist...");
targetDb.books.drop();
targetDb.authors.drop();
targetDb.categories.drop();
print("✓ Cleared collections: books, authors, categories.");

// 2. Insert Authors (At least 3 authors required - Requirement 1)
print("\n[Step 2/4] Inserting sample authors (Requirement 1 & 3)...");
const author1Id = ObjectId("660000000000000000000001");
const author2Id = ObjectId("660000000000000000000002");
const author3Id = ObjectId("660000000000000000000003");
const author4Id = ObjectId("660000000000000000000004");

const authorsData = [
  {
    _id: author1Id,
    name: "Robert C. Martin",
    bio: "Popularly known as Uncle Bob, legendary software engineer and co-author of the Agile Manifesto.",
    nationality: "American",
    birthYear: 1952,
    createdAt: new Date("2026-01-10T08:00:00Z")
  },
  {
    _id: author2Id,
    name: "Martin Fowler",
    bio: "Chief Scientist at Thoughtworks, author of Refactoring and Patterns of Enterprise Application Architecture.",
    nationality: "British",
    birthYear: 1963,
    createdAt: new Date("2026-01-12T09:30:00Z")
  },
  {
    _id: author3Id,
    name: "Kyle Simpson",
    bio: "JavaScript evangelist, open-source enthusiast, educator, and author of the 'You Don't Know JS' series.",
    nationality: "American",
    birthYear: 1980,
    createdAt: new Date("2026-01-15T11:00:00Z")
  },
  {
    _id: author4Id,
    name: "Eric Evans",
    bio: "Domain-Driven Design (DDD) thought leader, systems analyst and specialized software architecture consultant.",
    nationality: "American",
    birthYear: 1963,
    createdAt: new Date("2026-01-18T14:20:00Z")
  }
];

const authorsResult = targetDb.authors.insertMany(authorsData);
print(`✓ Successfully inserted ${Object.keys(authorsResult.insertedIds).length} authors.`);

// 3. Insert Categories (At least 3 categories required - Requirement 1)
print("\n[Step 3/4] Inserting sample categories (Requirement 1)...");
const cat1Id = ObjectId("661111111111111111111101");
const cat2Id = ObjectId("661111111111111111111102");
const cat3Id = ObjectId("661111111111111111111103");
const cat4Id = ObjectId("661111111111111111111104");

const categoriesData = [
  {
    _id: cat1Id,
    name: "Software Engineering",
    description: "Best practices, code hygiene, agile craftsmanship, testing, and clean architecture.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  },
  {
    _id: cat2Id,
    name: "Software Architecture",
    description: "Enterprise system design, domain-driven design, microservices, and refactoring patterns.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  },
  {
    _id: cat3Id,
    name: "Web Development",
    description: "Modern JavaScript, asynchronous runtime internals, Express.js backend, and frontend mastery.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  },
  {
    _id: cat4Id,
    name: "Database Systems",
    description: "Relational database design, NoSQL persistence models, indexing, and distributed storage.",
    createdAt: new Date("2026-01-05T00:00:00Z")
  }
];

const categoriesResult = targetDb.categories.insertMany(categoriesData);
print(`✓ Successfully inserted ${Object.keys(categoriesResult.insertedIds).length} categories.`);

// 4. Insert Books (At least 10 books required - Requirement 1 & 3)
// Each book includes: title, price, quantity, publishedYear, category, array of tags,
// referenced authorId (Requirement 3), and embedded reviews array (Requirement 3).
print("\n[Step 4/4] Inserting sample books with insertMany (Requirement 1 & 3)...");

const booksData = [
  {
    _id: ObjectId("662222222222222222222201"),
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 37.95,
    quantity: 25,
    publishedYear: 2008,
    category: "Software Engineering",
    categoryId: cat1Id,
    authorId: author1Id,
    tags: ["clean-code", "refactoring", "agile", "best-practices"],
    reviews: [
      { reviewer: "Alice Nguyen", rating: 5, comment: "A timeless masterpiece every programmer must read.", date: new Date("2026-02-01") },
      { reviewer: "Bob Smith", rating: 4, comment: "Great principles, though some Java examples are a bit dated.", date: new Date("2026-02-10") }
    ],
    createdAt: new Date("2026-01-20T10:00:00Z")
  },
  {
    _id: ObjectId("662222222222222222222202"),
    title: "The Clean Coder: A Code of Conduct for Professional Programmers",
    price: 34.50,
    quantity: 18,
    publishedYear: 2011,
    category: "Software Engineering",
    categoryId: cat1Id,
    authorId: author1Id,
    tags: ["professionalism", "career", "clean-code", "discipline"],
    reviews: [
      { reviewer: "Charlie Tran", rating: 5, comment: "Super practical advice on estimating, saying no, and ethics.", date: new Date("2026-02-14") }
    ],
    createdAt: new Date("2026-01-20T10:15:00Z")
  },
  {
    _id: ObjectId("662222222222222222222203"),
    title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design",
    price: 42.00,
    quantity: 12,
    publishedYear: 2017,
    category: "Software Architecture",
    categoryId: cat2Id,
    authorId: author1Id,
    tags: ["architecture", "clean-code", "solid", "design-patterns"],
    reviews: [
      { reviewer: "David Pham", rating: 5, comment: "The dependency inversion principle explained with razor sharpness.", date: new Date("2026-02-20") }
    ],
    createdAt: new Date("2026-01-20T10:30:00Z")
  },
  {
    _id: ObjectId("662222222222222222222204"),
    title: "Refactoring: Improving the Design of Existing Code",
    price: 49.99,
    quantity: 15,
    publishedYear: 2018,
    category: "Software Engineering",
    categoryId: cat1Id,
    authorId: author2Id,
    tags: ["refactoring", "code-smells", "testing", "javascript"],
    reviews: [
      { reviewer: "Eva Le", rating: 5, comment: "The 2nd edition in modern JavaScript is pure gold.", date: new Date("2026-02-25") },
      { reviewer: "Frank Miller", rating: 5, comment: "Every refactoring catalog entry is crystal clear.", date: new Date("2026-03-01") }
    ],
    createdAt: new Date("2026-01-20T11:00:00Z")
  },
  {
    _id: ObjectId("662222222222222222222205"),
    title: "Patterns of Enterprise Application Architecture",
    price: 54.00,
    quantity: 8,
    publishedYear: 2002,
    category: "Software Architecture",
    categoryId: cat2Id,
    authorId: author2Id,
    tags: ["enterprise", "architecture", "patterns", "data-mapper"],
    reviews: [
      { reviewer: "George Vu", rating: 4, comment: "Foundational architecture patterns, highly recommended.", date: new Date("2026-03-05") }
    ],
    createdAt: new Date("2026-01-20T11:15:00Z")
  },
  {
    _id: ObjectId("662222222222222222222206"),
    title: "You Don't Know JS Yet: Get Started",
    price: 18.99,
    quantity: 40,
    publishedYear: 2020,
    category: "Web Development",
    categoryId: cat3Id,
    authorId: author3Id,
    tags: ["javascript", "web", "fundamentals", "ydkjs"],
    reviews: [
      { reviewer: "Helen Hoang", rating: 5, comment: "Deepens your core JS intuition like nothing else.", date: new Date("2026-03-08") }
    ],
    createdAt: new Date("2026-01-20T11:30:00Z")
  },
  {
    _id: ObjectId("662222222222222222222207"),
    title: "You Don't Know JS Yet: Scope & Closures",
    price: 24.95,
    quantity: 35,
    publishedYear: 2020,
    category: "Web Development",
    categoryId: cat3Id,
    authorId: author3Id,
    tags: ["javascript", "closures", "scope", "ydkjs"],
    reviews: [
      { reviewer: "Ian Do", rating: 5, comment: "Demystifies lexical scope and hoisting permanently.", date: new Date("2026-03-10") },
      { reviewer: "Jenny Vo", rating: 5, comment: "Concise, deep, and beautifully explained.", date: new Date("2026-03-11") }
    ],
    createdAt: new Date("2026-01-20T11:45:00Z")
  },
  {
    _id: ObjectId("662222222222222222222208"),
    title: "You Don't Know JS Yet: Objects & Classes",
    price: 26.50,
    quantity: 22,
    publishedYear: 2021,
    category: "Web Development",
    categoryId: cat3Id,
    authorId: author3Id,
    tags: ["javascript", "prototypes", "objects", "classes", "ydkjs"],
    reviews: [
      { reviewer: "Kevin Lam", rating: 4, comment: "Prototypes explained without the syntactic sugar confusion.", date: new Date("2026-03-12") }
    ],
    createdAt: new Date("2026-01-20T12:00:00Z")
  },
  {
    _id: ObjectId("662222222222222222222209"),
    title: "Domain-Driven Design: Tackling Complexity in the Heart of Software",
    price: 58.50,
    quantity: 6,
    publishedYear: 2003,
    category: "Software Architecture",
    categoryId: cat2Id,
    authorId: author4Id,
    tags: ["ddd", "ubiquitous-language", "bounded-context", "architecture"],
    reviews: [
      { reviewer: "Linda Ngo", rating: 5, comment: "The blue book that changed modern enterprise architecture.", date: new Date("2026-03-14") }
    ],
    createdAt: new Date("2026-01-20T12:15:00Z")
  },
  {
    _id: ObjectId("662222222222222222222210"),
    title: "Domain-Driven Design Reference: Definitions and Pattern Summaries",
    price: 21.00,
    quantity: 14,
    publishedYear: 2014,
    category: "Software Architecture",
    categoryId: cat2Id,
    authorId: author4Id,
    tags: ["ddd", "reference", "architecture", "patterns"],
    reviews: [
      { reviewer: "Minh Tran", rating: 4, comment: "Great quick handbook summarizing all DDD tactical patterns.", date: new Date("2026-03-15") }
    ],
    createdAt: new Date("2026-01-20T12:30:00Z")
  },
  {
    _id: ObjectId("662222222222222222222211"),
    title: "Node.js Design Patterns: Design and implement production-grade Node.js apps",
    price: 45.00,
    quantity: 20,
    publishedYear: 2020,
    category: "Web Development",
    categoryId: cat3Id,
    authorId: author2Id,
    tags: ["nodejs", "express", "asynchronous", "design-patterns"],
    reviews: [
      { reviewer: "Nhi Nguyen", rating: 5, comment: "Best comprehensive guide to the Node.js event loop and streams.", date: new Date("2026-03-16") }
    ],
    createdAt: new Date("2026-01-20T12:45:00Z")
  },
  {
    _id: ObjectId("662222222222222222222212"),
    title: "Designing Data-Intensive Applications: The Big Ideas Behind Reliable Systems",
    price: 52.00,
    quantity: 5,
    publishedYear: 2017,
    category: "Database Systems",
    categoryId: cat4Id,
    authorId: author2Id,
    tags: ["database", "nosql", "distributed-systems", "reliability"],
    reviews: [
      { reviewer: "Oscar Bui", rating: 5, comment: "Unquestionably the best computing textbook of the decade.", date: new Date("2026-03-18") }
    ],
    createdAt: new Date("2026-01-20T13:00:00Z")
  },
  {
    _id: ObjectId("662222222222222222222213"),
    title: "Obsolete Draft: Deprecated Legacy Guide",
    price: 9.99,
    quantity: 0,
    publishedYear: 1999,
    category: "Software Engineering",
    categoryId: cat1Id,
    authorId: author1Id,
    tags: ["deprecated", "outdated"],
    reviews: [],
    createdAt: new Date("2026-01-20T13:15:00Z")
  }
];

const booksResult = targetDb.books.insertMany(booksData);
print(`✓ Successfully inserted ${Object.keys(booksResult.insertedIds).length} books.`);

print("\n=========================================================");
print("🎉 Sample Data Seeding Completed Successfully!");
print(`- Database   : ${targetDb.getName()}`);
print(`- Authors    : ${targetDb.authors.countDocuments()}`);
print(`- Categories : ${targetDb.categories.countDocuments()}`);
print(`- Books      : ${targetDb.books.countDocuments()}`);
print("=========================================================");
