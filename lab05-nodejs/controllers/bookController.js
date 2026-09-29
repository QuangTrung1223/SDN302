/**
 * Book Controller (Requirement 3 & Requirement 5)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import Book from '../models/Book.js';

/**
 * Helper to validate MongoDB ObjectId
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Requirement 3: getAll books
 * Uses find with query object, select, sort, limit, and pagination
 * GET /api/books
 */
export const getAll = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, inStock, keyword, select, sort, page = 1, limit = 10 } = req.query;

    // 1. Build Query Object
    const query = {};

    if (category) {
      query.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    if (inStock !== undefined) {
      query.inStock = inStock === 'true' || inStock === true;
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword.trim(), $options: 'i' } },
        { author: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    // 2. Setup Mongoose Query with find(query)
    let mongooseQuery = Book.find(query);

    // select specific fields: e.g. "title,price,category" -> "title price category"
    if (select) {
      const fields = select.split(',').join(' ');
      mongooseQuery = mongooseQuery.select(fields);
    }

    // sort: e.g. "-price" or "title"
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      mongooseQuery = mongooseQuery.sort(sortBy);
    } else {
      mongooseQuery = mongooseQuery.sort('-createdAt');
    }

    // limit and pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    mongooseQuery = mongooseQuery.skip(skip).limit(limitNum);

    // Execute query and count
    const [books, total] = await Promise.all([
      mongooseQuery.exec(),
      Book.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: books.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: getById
 * Returns 400 for invalid ObjectId, 404 if not found
 * GET /api/books/:id
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId (Requirement 3: Return 400 when identifier is not a valid ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        statusCode: 400,
        message: `The provided ID '${id}' is not a valid MongoDB ObjectId (must be a 24-character hexadecimal string).`,
      });
    }

    const book = await Book.findById(id);

    // Requirement 3: Return 404 when document is not found
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        statusCode: 404,
        message: `Book with id '${id}' was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: create a new Book
 * POST /api/books
 */
export const create = async (req, res, next) => {
  try {
    // Book.create triggers pre('save') and post('save') hooks, and full schema validation
    const newBook = await Book.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: update an existing Book
 * Uses findByIdAndUpdate with { new: true, runValidators: true }
 * 
 * WHY BOTH OPTIONS MATTER:
 * 1. `new: true`:
 *    By default, Mongoose returns the original document *before* the modification was applied.
 *    Setting `new: true` instructs Mongoose to return the newly updated document *after* applying modifications.
 * 2. `runValidators: true`:
 *    By default, Mongoose only validates against the schema upon document creation (.create() / .save()).
 *    Update queries (like findByIdAndUpdate) bypass schema validation by default.
 *    Setting `runValidators: true` forces Mongoose to run all schema validators (required, min, max, enum, custom)
 *    on the update payload, ensuring invalid data can never corrupt the database.
 * 
 * PUT /api/books/:id
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Requirement 3: Return 400 when identifier is not a valid ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        statusCode: 400,
        message: `The provided ID '${id}' is not a valid MongoDB ObjectId.`,
      });
    }

    // If title was updated in payload, regenerate slug
    if (req.body.title) {
      req.body.title = req.body.title.trim().replace(/\s+/g, ' ');
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true, // Return modified document
      runValidators: true, // Enforce schema validators on update operations
    });

    // Requirement 3: Return 404 when document is not found
    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        statusCode: 404,
        message: `Cannot update: Book with id '${id}' was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: remove a Book
 * DELETE /api/books/:id
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Requirement 3: Return 400 when identifier is not a valid ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        statusCode: 400,
        message: `The provided ID '${id}' is not a valid MongoDB ObjectId.`,
      });
    }

    const deletedBook = await Book.findByIdAndDelete(id);

    // Requirement 3: Return 404 when document is not found
    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        statusCode: 404,
        message: `Cannot delete: Book with id '${id}' was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Book '${deletedBook.title}' (ID: ${deletedBook._id}) was deleted successfully.`,
      data: deletedBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 5: Call Static Method (findByCategory)
 * GET /api/books/by-category/:category
 */
export const getByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    // Call static method defined on Book model
    const books = await Book.findByCategory(category);

    return res.status(200).json({
      success: true,
      category,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 5: Call Instance Method (getSummary)
 * GET /api/books/:id/summary
 */
export const getSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        statusCode: 400,
        message: `The provided ID '${id}' is not a valid MongoDB ObjectId.`,
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        statusCode: 404,
        message: `Book with id '${id}' was not found.`,
      });
    }

    // Call instance method on the book document
    const summary = book.getSummary();

    return res.status(200).json({
      success: true,
      id: book._id,
      title: book.title,
      summary,
      virtualFormattedPrice: book.formattedPrice,
    });
  } catch (error) {
    next(error);
  }
};
