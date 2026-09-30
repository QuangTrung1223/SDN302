/**
 * Database Seeding Script for Lab 06
 * Populates Authors, Categories, Users, Books, and Reviews with Mongoose relationships
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from './config/db.js';
import Author from './models/Author.js';
import Category from './models/Category.js';
import User from './models/User.js';
import Book from './models/Book.js';
import Review from './models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const authorsData = [
  {
    name: 'Robert C. Martin',
    bio: 'Software engineer, author, and co-author of the Agile Manifesto. Widely known as "Uncle Bob".',
    website: 'http://cleancoder.com',
    nationality: 'American',
    birthYear: 1952,
    country: 'United States',
  },
  {
    name: 'Martin Fowler',
    bio: 'Chief Scientist at ThoughtWorks, author on software architecture, refactoring, and enterprise design patterns.',
    website: 'https://martinfowler.com',
    nationality: 'British',
    birthYear: 1963,
    country: 'United Kingdom',
  },
  {
    name: 'Martin Kleppmann',
    bio: 'Researcher in distributed systems and security at the University of Cambridge; author of Designing Data-Intensive Applications.',
    website: 'https://martin.kleppmann.com',
    nationality: 'German',
    birthYear: 1984,
    country: 'Germany',
  },
  {
    name: 'Gene Kim',
    bio: 'DevOps researcher, founder of Tripwire, and author of The Phoenix Project and The DevOps Handbook.',
    website: 'https://itrevolution.com',
    nationality: 'American',
    birthYear: 1971,
    country: 'United States',
  },
];

const categoriesData = [
  {
    name: 'Software Engineering',
    description: 'Clean code craftsmanship, refactoring patterns, and agile engineering practices.',
  },
  {
    name: 'Architecture',
    description: 'Distributed systems, microservices design, scalability, and data storage fundamentals.',
  },
  {
    name: 'DevOps',
    description: 'Continuous integration, deployment automation, cloud infrastructure, and observability.',
  },
  {
    name: 'Computer Science',
    description: 'Foundational computation theory, algorithms, and data structure principles.',
  },
];

const usersData = [
  {
    username: 'alice_reader',
    email: 'alice@booknest.io',
    fullName: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    role: 'customer',
  },
  {
    username: 'bob_reviewer',
    email: 'bob@booknest.io',
    fullName: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    role: 'reviewer',
  },
  {
    username: 'charlie_architect',
    email: 'charlie@booknest.io',
    fullName: 'Charlie Brown',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150',
    role: 'reviewer',
  },
  {
    username: 'diana_admin',
    email: 'diana@booknest.io',
    fullName: 'Diana Prince',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150',
    role: 'admin',
  },
];

export const seedDatabase = async (shouldDisconnect = true) => {
  try {
    console.log('====================================================');
    console.log('  🌱 BOOKNEST LAB 06 - RELATIONSHIP SEEDING SCRIPT');
    console.log('====================================================\n');

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[seed.js] Clearing existing documents in all collections...');
    await Promise.all([
      Author.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
      Book.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // 1. Insert Authors
    console.log('[seed.js] Inserting Authors...');
    const authors = await Author.insertMany(authorsData);
    console.log(`[seed.js] ✔ Created ${authors.length} authors.`);

    // 2. Insert Categories
    console.log('[seed.js] Inserting Categories...');
    const categories = [];
    for (const c of categoriesData) {
      categories.push(await Category.create(c));
    }
    console.log(`[seed.js] ✔ Created ${categories.length} categories.`);

    // 3. Insert Users
    console.log('[seed.js] Inserting Users...');
    const users = await User.insertMany(usersData);
    console.log(`[seed.js] ✔ Created ${users.length} users.`);

    // Author and Category Mappings
    const [uncleBob, fowler, kleppmann, geneKim] = authors;
    const [catSoftEng, catArch, catDevOps, catCS] = categories;
    const [alice, bob, charlie, diana] = users;

    // 4. Insert Books referencing Authors and Categories via ObjectId
    console.log('[seed.js] Inserting Books with normalized ObjectId references...');
    const booksRaw = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: uncleBob._id,
        category: catSoftEng._id,
        isbn: '978-0132350884',
        price: 37.50,
        quantity: 15,
        publishedYear: 2008,
        description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
        inStock: true,
        tags: ['clean-code', 'agile', 'craftsmanship'],
      },
      {
        title: 'Clean Architecture: A Craftsman’s Guide to Software Structure',
        author: uncleBob._id,
        category: catSoftEng._id,
        isbn: '978-0134494166',
        price: 39.99,
        quantity: 11,
        publishedYear: 2017,
        description: 'Practical solutions for the real challenges faced by software architects and system designers.',
        inStock: true,
        tags: ['architecture', 'solid', 'clean-code'],
      },
      {
        title: 'Refactoring: Improving the Design of Existing Code',
        author: fowler._id,
        category: catSoftEng._id,
        isbn: '978-0134757599',
        price: 52.00,
        quantity: 8,
        publishedYear: 2018,
        description: 'Completely updated for JavaScript, explaining the principles of refactoring and code smells.',
        inStock: true,
        tags: ['refactoring', 'design', 'patterns'],
      },
      {
        title: 'Patterns of Enterprise Application Architecture',
        author: fowler._id,
        category: catArch._id,
        isbn: '978-0321127426',
        price: 59.99,
        quantity: 6,
        publishedYear: 2002,
        description: 'The classic handbook describing enterprise architecture patterns and object-relational mapping.',
        inStock: true,
        tags: ['patterns', 'enterprise', 'architecture'],
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: kleppmann._id,
        category: catArch._id,
        isbn: '978-1449373320',
        price: 49.99,
        quantity: 12,
        publishedYear: 2017,
        description: 'The definitive guide to data storage, replication, partitioning, and distributed transactions.',
        inStock: true,
        tags: ['distributed-systems', 'database', 'scalability'],
      },
      {
        title: 'The Phoenix Project: A Novel about IT, DevOps, and Helping Your Business Win',
        author: geneKim._id,
        category: catDevOps._id,
        isbn: '978-1942788294',
        price: 24.95,
        quantity: 25,
        publishedYear: 2018,
        description: 'A riveting narrative showing how DevOps principles transform IT operations and business outcomes.',
        inStock: true,
        tags: ['devops', 'lean', 'management'],
      },
      {
        title: 'The DevOps Handbook: How to Create World-Class Agility',
        author: geneKim._id,
        category: catDevOps._id,
        isbn: '978-1942788003',
        price: 34.50,
        quantity: 14,
        publishedYear: 2016,
        description: 'How to replicate the incredible outcomes of DevOps titans like Amazon, Netflix, and Google.',
        inStock: true,
        tags: ['devops', 'ci-cd', 'automation'],
      },
    ];

    const createdBooks = [];
    for (const b of booksRaw) {
      createdBooks.push(await Book.create(b));
    }
    console.log(`[seed.js] ✔ Created ${createdBooks.length} books with relational references.`);

    // 5. Insert Reviews referencing Book and User (for deep population & match/options)
    console.log('[seed.js] Inserting Reviews linking Books and Users...');
    const [cleanCode, cleanArch, refactoring, eaa, ddia, phoenix] = createdBooks;

    const reviewsData = [
      // Clean Code reviews
      {
        book: cleanCode._id,
        user: bob._id,
        rating: 5,
        comment: 'Essential reading for any professional software craftsman. Transformed how I write code.',
      },
      {
        book: cleanCode._id,
        user: charlie._id,
        rating: 4,
        comment: 'Great principles on naming and function length, although some examples are slightly dated.',
      },
      {
        book: cleanCode._id,
        user: alice._id,
        rating: 2,
        comment: 'A bit opinionated and dogmatic in some sections, but still worth reading.',
      },
      // Designing Data-Intensive Applications reviews
      {
        book: ddia._id,
        user: charlie._id,
        rating: 5,
        comment: 'Hands down the best technical book on distributed systems and databases ever published.',
      },
      {
        book: ddia._id,
        user: bob._id,
        rating: 5,
        comment: 'Exceptional depth on consensus algorithms, replication logs, and partitioning strategies.',
      },
      {
        book: ddia._id,
        user: diana._id,
        rating: 4,
        comment: 'Very comprehensive, a must-have reference on every system architect desk.',
      },
      // Refactoring reviews
      {
        book: refactoring._id,
        user: alice._id,
        rating: 5,
        comment: 'Martin Fowler explains code smells and step-by-step transformations with crystal clarity.',
      },
      {
        book: refactoring._id,
        user: bob._id,
        rating: 4,
        comment: 'The JavaScript second edition is a welcome modernization of the classic patterns.',
      },
      // Phoenix Project reviews
      {
        book: phoenix._id,
        user: alice._id,
        rating: 5,
        comment: 'Could not put it down! Reads like a gripping novel while teaching core DevOps principles.',
      },
      {
        book: phoenix._id,
        user: diana._id,
        rating: 4,
        comment: 'Super relatable scenario of IT firefighting and the transformation to flow.',
      },
    ];

    const createdReviews = await Review.insertMany(reviewsData);
    console.log(`[seed.js] ✔ Created ${createdReviews.length} reviews linking books and users.`);

    console.log('\n====================================================');
    console.log('  ✅ LAB 06 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`  Authors:    ${authors.length}`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Users:      ${users.length}`);
    console.log(`  Books:      ${createdBooks.length}`);
    console.log(`  Reviews:    ${createdReviews.length}`);
    console.log('====================================================\n');
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
