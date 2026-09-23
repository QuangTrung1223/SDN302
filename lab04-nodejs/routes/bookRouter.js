/**
 * Express RESTful Router for Books with MongoDB Persistence (Requirement 4 & 5)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  isValidObjectId
} from '../services/bookService.js';

const router = Router();

const ALLOWED_CATEGORIES = [
  'Software Engineering',
  'Software Architecture',
  'Web Development',
  'Database Systems',
  'IT',
  'Business',
  'Literature',
  'Fiction',
  'Science'
];

/**
 * Validate book payload for POST / PUT
 * @param {Object} body
 * @param {boolean} isUpdate
 * @returns {Array<string>} List of validation errors
 */
const validateBookInput = (body, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || body.title !== undefined) {
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push("Field 'title' is required and must be a non-empty string.");
    }
  }

  if (!isUpdate || body.price !== undefined) {
    const priceNum = Number(body.price);
    if (body.price === undefined || isNaN(priceNum) || priceNum <= 0) {
      errors.push("Field 'price' is required and must be a positive number greater than 0.");
    }
  }

  if (body.category !== undefined) {
    if (!body.category || typeof body.category !== 'string' || body.category.trim().length === 0) {
      errors.push("Field 'category' must be a non-empty string.");
    }
  }

  const qty = body.quantity !== undefined ? body.quantity : body.stock;
  if (qty !== undefined) {
    const qtyNum = Number(qty);
    if (isNaN(qtyNum) || qtyNum < 0 || !Number.isInteger(qtyNum)) {
      errors.push("Field 'quantity' (or 'stock') must be a non-negative integer (>= 0).");
    }
  }

  return errors;
};

// =============================================================================
// REQUIREMENT 5: ADVANCED SEARCH ENDPOINT
// GET /api/books/search?category=...&minPrice=...&maxPrice=...&keyword=...&page=1&limit=5
// =============================================================================
router.get('/search', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, keyword, page, limit } = req.query;

    const result = await searchBooks({
      category,
      minPrice,
      maxPrice,
      keyword,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.data,
      message: 'Books searched successfully'
    });
  } catch (err) {
    console.error('[bookRouter:search] Error:', err);
    res.status(500).json({
      success: false,
      error: 'DatabaseError',
      message: `Failed to search books in database: ${err.message}`
    });
  }
});

// =============================================================================
// REQUIREMENT 4: GET ALL BOOKS (WITH PAGINATION)
// GET /api/books?page=1&limit=10
// =============================================================================
router.get('/', async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getAllBooks({ page, limit });

    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.data,
      message: 'Books retrieved successfully'
    });
  } catch (err) {
    console.error('[bookRouter:getAll] Error:', err);
    res.status(500).json({
      success: false,
      error: 'DatabaseError',
      message: `Failed to retrieve books from database: ${err.message}`
    });
  }
});

// =============================================================================
// REQUIREMENT 4: GET BOOK BY ID
// GET /api/books/:id
// =============================================================================
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      error: 'InvalidIdError',
      message: `Invalid book ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`
    });
  }

  try {
    const book = await getBookById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: `Book with id '${id}' was not found in catalog.`
      });
    }

    res.status(200).json({
      success: true,
      data: book,
      message: `Book '${id}' retrieved successfully`
    });
  } catch (err) {
    console.error(`[bookRouter:getById] Error for id ${id}:`, err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      success: false,
      error: err.name || 'DatabaseError',
      message: `Failed to retrieve book by id from database: ${err.message}`
    });
  }
});

// =============================================================================
// REQUIREMENT 4: CREATE BOOK
// POST /api/books
// =============================================================================
router.post('/', async (req, res) => {
  const validationErrors = validateBookInput(req.body, false);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Invalid book data provided',
      details: validationErrors
    });
  }

  try {
    const createdBook = await createBook(req.body);

    res.status(201).json({
      success: true,
      data: createdBook,
      message: 'Book created successfully in MongoDB'
    });
  } catch (err) {
    console.error('[bookRouter:create] Error:', err);
    res.status(500).json({
      success: false,
      error: 'DatabaseError',
      message: `Failed to create book in database: ${err.message}`
    });
  }
});

// =============================================================================
// REQUIREMENT 4: UPDATE BOOK BY ID
// PUT /api/books/:id
// =============================================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      error: 'InvalidIdError',
      message: `Invalid book ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`
    });
  }

  const validationErrors = validateBookInput(req.body, true);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Invalid book update data provided',
      details: validationErrors
    });
  }

  try {
    const updatedBook = await updateBook(id, req.body);

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: `Book with id '${id}' was not found in catalog to update.`
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBook,
      message: `Book '${id}' updated successfully in MongoDB`
    });
  } catch (err) {
    console.error(`[bookRouter:update] Error for id ${id}:`, err);
    res.status(500).json({
      success: false,
      error: 'DatabaseError',
      message: `Failed to update book in database: ${err.message}`
    });
  }
});

// =============================================================================
// REQUIREMENT 4: DELETE BOOK BY ID
// DELETE /api/books/:id
// =============================================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      error: 'InvalidIdError',
      message: `Invalid book ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`
    });
  }

  try {
    const deleted = await deleteBook(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: `Book with id '${id}' was not found in catalog to delete.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Book '${id}' deleted successfully from MongoDB`
    });
  } catch (err) {
    console.error(`[bookRouter:delete] Error for id ${id}:`, err);
    res.status(500).json({
      success: false,
      error: 'DatabaseError',
      message: `Failed to delete book from database: ${err.message}`
    });
  }
});

export default router;
