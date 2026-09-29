/**
 * Database Seeding Script for Lab 05
 * Populates MongoDB with Category and Book documents using Mongoose ODM
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from './config/db.js';
import Book from './models/Book.js';
import Category from './models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const categoriesData = [
  {
    name: 'Software Engineering',
    description: 'Methodologies, software design principles, refactoring, and code craftsmanship.',
  },
  {
    name: 'Programming',
    description: 'Language syntax, idiomatic patterns, functional and object-oriented programming.',
  },
  {
    name: 'Architecture',
    description: 'Distributed systems, microservices patterns, high availability, and scalability.',
  },
  {
    name: 'DevOps',
    description: 'Continuous delivery, cloud infrastructure, containerization, and site reliability.',
  },
  {
    name: 'Computer Science',
    description: 'Algorithms, data structures, computation theory, and foundational CS principles.',
  },
];

const booksData = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Software Engineering',
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
    price: 37.50,
    quantity: 15,
    publishedYear: 2008,
    publishedDate: new Date('2008-08-01'),
    inStock: true,
    isFeatured: true,
    tags: ['clean-code', 'agile', 'best-practices', 'refactoring'],
  },
  {
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    category: 'Software Engineering',
    description: 'Illustrates the best practices and major pitfalls of many different aspects of software development.',
    price: 44.99,
    quantity: 20,
    publishedYear: 2019,
    publishedDate: new Date('2019-09-13'),
    inStock: true,
    isFeatured: true,
    tags: ['craftsmanship', 'career', 'pragmatic', 'tips'],
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    category: 'Architecture',
    description: 'The definitive guide to data storage, replication, partitioning, and distributed transactions.',
    price: 49.99,
    quantity: 12,
    publishedYear: 2017,
    publishedDate: new Date('2017-03-16'),
    inStock: true,
    isFeatured: true,
    tags: ['distributed-systems', 'database', 'scalability', 'big-data'],
  },
  {
    title: 'Refactoring: Improving the Design of Existing Code',
    author: 'Martin Fowler',
    isbn: '978-0134757599',
    category: 'Software Engineering',
    description: 'Completely updated for JavaScript, explaining the principles of refactoring and code smells.',
    price: 52.00,
    quantity: 8,
    publishedYear: 2018,
    publishedDate: new Date('2018-11-20'),
    inStock: true,
    isFeatured: false,
    tags: ['refactoring', 'design', 'clean-code', 'javascript'],
  },
  {
    title: 'Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation',
    author: 'Jez Humble, David Farley',
    isbn: '978-0321601919',
    category: 'DevOps',
    description: 'Sets out the principles and technical practices that enable rapid, incremental delivery of high-quality features.',
    price: 46.50,
    quantity: 7,
    publishedYear: 2010,
    publishedDate: new Date('2010-07-27'),
    inStock: true,
    isFeatured: false,
    tags: ['ci-cd', 'devops', 'automation', 'testing'],
  },
  {
    title: 'The Phoenix Project: A Novel about IT, DevOps, and Helping Your Business Win',
    author: 'Gene Kim, Kevin Behr, George Spafford',
    isbn: '978-1942788294',
    category: 'DevOps',
    description: 'A riveting narrative showing how DevOps principles transform IT operations and business outcomes.',
    price: 24.95,
    quantity: 25,
    publishedYear: 2018,
    publishedDate: new Date('2018-04-16'),
    inStock: true,
    isFeatured: true,
    tags: ['devops', 'lean', 'it-management', 'novel'],
  },
  {
    title: 'Structure and Interpretation of Computer Programs',
    author: 'Harold Abelson, Gerald Jay Sussman',
    isbn: '978-0262510875',
    category: 'Computer Science',
    description: 'A legendary foundation text emphasizing abstraction, recursion, and computational models.',
    price: 65.00,
    quantity: 5,
    publishedYear: 1996,
    publishedDate: new Date('1996-07-25'),
    inStock: true,
    isFeatured: false,
    tags: ['algorithms', 'functional-programming', 'theory', 'scheme'],
  },
  {
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    isbn: '978-0262046305',
    category: 'Computer Science',
    description: 'The leading algorithm textbook in universities worldwide, providing in-depth rigorous coverage.',
    price: 89.99,
    quantity: 10,
    publishedYear: 2022,
    publishedDate: new Date('2022-04-05'),
    inStock: true,
    isFeatured: false,
    tags: ['algorithms', 'data-structures', 'math', 'clrs'],
  },
  {
    title: 'Eloquent JavaScript: A Modern Introduction to Programming',
    author: 'Marijn Haverbeke',
    isbn: '978-1593279509',
    category: 'Programming',
    description: 'A deep dive into JavaScript that takes you from basics through functional and asynchronous programming.',
    price: 29.99,
    quantity: 18,
    publishedYear: 2018,
    publishedDate: new Date('2018-12-04'),
    inStock: true,
    isFeatured: true,
    tags: ['javascript', 'web', 'frontend', 'nodejs'],
  },
  {
    title: 'Microservices Patterns: With examples in Java',
    author: 'Chris Richardson',
    isbn: '978-1617294549',
    category: 'Architecture',
    description: 'Teaches how to develop and deploy production-quality microservices-based applications.',
    price: 54.99,
    quantity: 9,
    publishedYear: 2018,
    publishedDate: new Date('2018-11-19'),
    inStock: true,
    isFeatured: false,
    tags: ['microservices', 'saga-pattern', 'event-sourcing', 'architecture'],
  },
  {
    title: 'Site Reliability Engineering: How Google Runs Production Systems',
    author: 'Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Murphy',
    isbn: '978-1491929124',
    category: 'DevOps',
    description: 'Insights from key members of Google’s SRE team explaining their production principles and practices.',
    price: 42.00,
    quantity: 14,
    publishedYear: 2016,
    publishedDate: new Date('2016-04-16'),
    inStock: true,
    isFeatured: false,
    tags: ['sre', 'google', 'monitoring', 'reliability'],
  },
  {
    title: 'Clean Architecture: A Craftsman’s Guide to Software Structure',
    author: 'Robert C. Martin',
    isbn: '978-0134494166',
    category: 'Software Engineering',
    description: 'Practical solutions for the real challenges faced by software architects and system designers.',
    price: 39.99,
    quantity: 11,
    publishedYear: 2017,
    publishedDate: new Date('2017-09-17'),
    inStock: true,
    isFeatured: true,
    tags: ['architecture', 'solid', 'clean-architecture', 'design'],
  },
];

export const seedDatabase = async (shouldDisconnect = true) => {
  try {
    console.log('====================================================');
    console.log('  🌱 BOOKNEST LAB 05 - MONGOOSE SEEDING SCRIPT');
    console.log('====================================================\n');

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[seed.js] Clearing existing data in collections...');
    await Category.deleteMany({});
    await Book.deleteMany({});

    console.log('[seed.js] Inserting categories...');
    const createdCategories = [];
    for (const cat of categoriesData) {
      const created = await Category.create(cat);
      createdCategories.push(created);
    }
    console.log(`[seed.js] ✔ Created ${createdCategories.length} categories.`);

    console.log('[seed.js] Inserting books (triggering pre/post save hooks & validation)...');
    const createdBooks = [];
    for (const book of booksData) {
      const created = await Book.create(book);
      createdBooks.push(created);
    }
    console.log(`[seed.js] ✔ Created ${createdBooks.length} books.`);

    console.log('\n====================================================');
    console.log('  ✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`  Categories: ${createdCategories.length}`);
    console.log(`  Books:      ${createdBooks.length}`);
    console.log('====================================================');
  } catch (error) {
    console.error('[seed.js] ✖ Seeding failed:', error);
    throw error;
  } finally {
    if (shouldDisconnect) {
      await disconnectDB();
    }
  }
};

const isDirectRun = process.argv[1] && process.argv[1].endsWith('seed.js');
if (isDirectRun) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;

