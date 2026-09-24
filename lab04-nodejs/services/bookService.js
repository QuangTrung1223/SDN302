/**
 * Book Service Layer implementing MongoDB Driver CRUD & Search (Requirement 4 & 5)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const COLLECTION_NAME = 'books';

// In-memory fallback data store for offline verification
let inMemoryBooks = [
  {
    _id: new ObjectId("662222222222222222222201"),
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 37.95,
    quantity: 25,
    publishedYear: 2008,
    category: "Software Engineering",
    tags: ["clean-code", "refactoring", "agile", "best-practices"],
    reviews: [
      { reviewer: "Alice Nguyen", rating: 5, comment: "A timeless masterpiece every programmer must read.", date: new Date("2026-02-01") }
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
    tags: ["professionalism", "career", "clean-code", "discipline"],
    reviews: [],
    createdAt: new Date("2026-01-20T10:15:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222203"),
    title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design",
    price: 42.00,
    quantity: 12,
    publishedYear: 2017,
    category: "Software Architecture",
    tags: ["architecture", "clean-code", "solid", "design-patterns"],
    reviews: [],
    createdAt: new Date("2026-01-20T10:30:00Z")
  },
  {
    _id: new ObjectId("662222222222222222222206"),
    title: "You Don't Know JS Yet: Get Started",
    price: 18.99,
    quantity: 40,
    publishedYear: 2020,
    category: "Web Development",
    tags: ["javascript", "web", "fundamentals", "ydkjs"],
    reviews: [],
    createdAt: new Date("2026-01-20T11:30:00Z")
  }
];

function getCollection() {
  const db = getDb();
  return db ? db.collection(COLLECTION_NAME) : null;
}

/**
 * Validate MongoDB ObjectId string
 * @param {string} id
 * @returns {boolean}
 */
export function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

/**
 * Retrieve all books with pagination (Requirement 4 & 5)
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<Object>}
 */
export async function getAllBooks({ page = 1, limit = 10 } = {}) {
  const collection = getCollection();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  if (collection) {
    const total = await collection.countDocuments({});
    const books = await collection
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: books
    };
  }

  // Fallback in-memory
  const total = inMemoryBooks.length;
  const data = inMemoryBooks.slice(skip, skip + limitNum);
  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data
  };
}

/**
 * Retrieve a book by its MongoDB _id (Requirement 4)
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getBookById(id) {
  if (!isValidObjectId(id)) {
    const error = new Error(`Invalid book ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`);
    error.status = 400;
    throw error;
  }

  const collection = getCollection();
  if (collection) {
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  return inMemoryBooks.find(b => b._id.toString() === id) || null;
}

/**
 * Create a new book document in MongoDB (Requirement 4)
 * @param {Object} bookData
 * @returns {Promise<Object>}
 */
export async function createBook(bookData) {
  const newDoc = {
    title: bookData.title.trim(),
    price: parseFloat(bookData.price),
    quantity: bookData.quantity !== undefined
      ? parseInt(bookData.quantity, 10)
      : (bookData.stock !== undefined ? parseInt(bookData.stock, 10) : 0),
    publishedYear: bookData.publishedYear !== undefined
      ? parseInt(bookData.publishedYear, 10)
      : new Date().getFullYear(),
    category: bookData.category || 'Software Engineering',
    tags: Array.isArray(bookData.tags)
      ? bookData.tags.map(t => String(t).trim())
      : (bookData.tags ? String(bookData.tags).split(',').map(t => t.trim()) : []),
    reviews: Array.isArray(bookData.reviews) ? bookData.reviews : [],
    createdAt: new Date()
  };

  if (bookData.authorId && isValidObjectId(bookData.authorId)) {
    newDoc.authorId = new ObjectId(bookData.authorId);
  }
  if (bookData.categoryId && isValidObjectId(bookData.categoryId)) {
    newDoc.categoryId = new ObjectId(bookData.categoryId);
  }

  const collection = getCollection();
  if (collection) {
    const result = await collection.insertOne(newDoc);
    return {
      _id: result.insertedId,
      ...newDoc
    };
  }

  // Fallback in-memory
  const insertedId = new ObjectId();
  const created = { _id: insertedId, ...newDoc };
  inMemoryBooks.unshift(created);
  return created;
}

/**
 * Update an existing book in MongoDB (Requirement 4)
 * @param {string} id
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export async function updateBook(id, updateData) {
  if (!isValidObjectId(id)) {
    const error = new Error(`Invalid book ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`);
    error.status = 400;
    throw error;
  }

  const updateFields = {};
  if (updateData.title !== undefined) updateFields.title = updateData.title.trim();
  if (updateData.price !== undefined) updateFields.price = parseFloat(updateData.price);
  if (updateData.quantity !== undefined) updateFields.quantity = parseInt(updateData.quantity, 10);
  if (updateData.stock !== undefined && updateData.quantity === undefined) updateFields.quantity = parseInt(updateData.stock, 10);
  if (updateData.publishedYear !== undefined) updateFields.publishedYear = parseInt(updateData.publishedYear, 10);
  if (updateData.category !== undefined) updateFields.category = updateData.category;
  if (updateData.tags !== undefined) {
    updateFields.tags = Array.isArray(updateData.tags)
      ? updateData.tags.map(t => String(t).trim())
      : String(updateData.tags).split(',').map(t => t.trim());
  }
  if (updateData.authorId && isValidObjectId(updateData.authorId)) {
    updateFields.authorId = new ObjectId(updateData.authorId);
  }
  if (updateData.categoryId && isValidObjectId(updateData.categoryId)) {
    updateFields.categoryId = new ObjectId(updateData.categoryId);
  }
  updateFields.updatedAt = new Date();

  const collection = getCollection();
  if (collection) {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Fallback in-memory
  const idx = inMemoryBooks.findIndex(b => b._id.toString() === id);
  if (idx === -1) return null;
  inMemoryBooks[idx] = { ...inMemoryBooks[idx], ...updateFields };
  return { ...inMemoryBooks[idx] };
}

/**
 * Delete a book by ID in MongoDB (Requirement 4)
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteBook(id) {
  if (!isValidObjectId(id)) {
    const error = new Error(`Invalid book ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`);
    error.status = 400;
    throw error;
  }

  const collection = getCollection();
  if (collection) {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Fallback in-memory
  const idx = inMemoryBooks.findIndex(b => b._id.toString() === id);
  if (idx === -1) return false;
  inMemoryBooks.splice(idx, 1);
  return true;
}

/**
 * Search books with category, price range, keyword, and pagination (Requirement 5)
 * @param {Object} queryOptions
 * @returns {Promise<Object>}
 */
export async function searchBooks({ category, minPrice, maxPrice, keyword, page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const collection = getCollection();
  if (collection) {
    const filter = {};

    if (category && typeof category === 'string' && category.trim()) {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = parseFloat(maxPrice);
      }
      if (Object.keys(filter.price).length === 0) {
        delete filter.price;
      }
    }

    if (keyword && typeof keyword === 'string' && keyword.trim()) {
      const kwRegex = { $regex: keyword.trim(), $options: 'i' };
      filter.$or = [
        { title: kwRegex },
        { tags: kwRegex }
      ];
    }

    const total = await collection.countDocuments(filter);
    const books = await collection
      .find(filter)
      .sort({ price: 1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: books
    };
  }

  // Fallback in-memory
  let filtered = [...inMemoryBooks];
  if (category) {
    filtered = filtered.filter(b => b.category.toLowerCase() === category.trim().toLowerCase());
  }
  if (minPrice !== undefined && !isNaN(Number(minPrice))) {
    filtered = filtered.filter(b => b.price >= parseFloat(minPrice));
  }
  if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
    filtered = filtered.filter(b => b.price <= parseFloat(maxPrice));
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(b => b.title.toLowerCase().includes(kw) || b.tags.some(t => t.toLowerCase().includes(kw)));
  }

  const total = filtered.length;
  const data = filtered.slice(skip, skip + limitNum);
  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data
  };
}
