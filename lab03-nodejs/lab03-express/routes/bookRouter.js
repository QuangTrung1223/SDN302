import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  ALLOWED_CATEGORIES
} from '../data/books.js';

const router = Router();

/**
 * Helper to validate Book input
 * Checks: title required, price positive number, category from fixed list
 */
const validateBookInput = (body, isUpdate = false) => {
  const errors = [];

  // For update, if field is not provided, it keeps old value. But if provided, it must be valid.
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

  if (!isUpdate || body.category !== undefined) {
    if (!body.category || !ALLOWED_CATEGORIES.includes(body.category)) {
      errors.push(
        `Field 'category' is required and must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`
      );
    }
  }

  if (body.stock !== undefined) {
    const stockNum = Number(body.stock);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.push("Field 'stock' must be a non-negative integer (>= 0).");
    }
  }

  return errors;
};

/**
 * GET /api/books/error-test
 * Deliberately throw an error to demonstrate central error-handling middleware (Requirement 4)
 * Note: Placed before /:id to prevent matching 'error-test' as an id parameter.
 */
router.get('/error-test', (req, res, next) => {
  // Deliberate exception thrown synchronously or passed to next()
  throw new Error(
    'Deliberate test error triggered at GET /api/books/error-test to verify Central Error Handler (Requirement 4).'
  );
});

/**
 * GET /api/books
 * List all books (Requirement 2)
 */
router.get('/', (req, res) => {
  const books = getAllBooks();
  res.status(200).json({
    success: true,
    total: books.length,
    data: books,
    message: 'Books retrieved successfully'
  });
});

/**
 * GET /api/books/:id
 * Retrieve a book by its numeric ID (Requirement 2)
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const book = getBookById(id);

  if (!book) {
    return res.status(404).json({
      success: false,
      error: 'NotFound',
      message: `Book with id ${id} was not found`
    });
  }

  res.status(200).json({
    success: true,
    data: book,
    message: `Book ${id} retrieved successfully`
  });
});

/**
 * POST /api/books
 * Create a new book (Requirement 2 & Requirement 4 validation)
 */
router.post('/', (req, res) => {
  const validationErrors = validateBookInput(req.body, false);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Invalid book data provided',
      details: validationErrors
    });
  }

  const created = createBook(req.body);
  res.status(201).json({
    success: true,
    data: created,
    message: 'Book created successfully'
  });
});

/**
 * PUT /api/books/:id
 * Update an existing book (Requirement 2 & Requirement 4 validation)
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = getBookById(id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'NotFound',
      message: `Book with id ${id} was not found`
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

  const updated = updateBook(id, req.body);
  res.status(200).json({
    success: true,
    data: updated,
    message: `Book ${id} updated successfully`
  });
});

/**
 * DELETE /api/books/:id
 * Delete a book by ID (Requirement 2)
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteBook(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'NotFound',
      message: `Book with id ${id} was not found`
    });
  }

  res.status(200).json({
    success: true,
    data: deleted,
    message: `Book ${id} deleted successfully`
  });
});

export default router;
