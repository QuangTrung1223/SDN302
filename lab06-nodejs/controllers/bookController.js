/**
 * Book Controller (Requirements 2 & 3: Population, Deep Population, Match, Options)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import Book from '../models/Book.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Requirement 2: getAll books with two-path population and select projection
 * GET /api/books
 * Supports query params:
 * - populate=false (returns raw ObjectIds for before/after comparison)
 * - category, minPrice, maxPrice, keyword, sort, page, limit
 */
export const getAll = async (req, res, next) => {
  try {
    const {
      populate = 'true',
      category,
      author,
      minPrice,
      maxPrice,
      keyword,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (category && isValidObjectId(category)) {
      query.category = category;
    }
    if (author && isValidObjectId(author)) {
      query.author = author;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    let mongooseQuery = Book.find(query);

    // =========================================================================
    // Requirement 2: Populate two paths in a single query and limit returned fields with select
    // =========================================================================
    const shouldPopulate = populate !== 'false' && populate !== false;

    if (shouldPopulate) {
      mongooseQuery = mongooseQuery
        // Path 1: Author (selecting only name, bio, nationality)
        .populate({
          path: 'author',
          select: 'name bio nationality website',
        })
        // Path 2: Category (selecting only name, slug, description)
        .populate({
          path: 'category',
          select: 'name slug description',
        });
    }

    // Sorting & Pagination
    if (sort) {
      mongooseQuery = mongooseQuery.sort(sort.split(',').join(' '));
    } else {
      mongooseQuery = mongooseQuery.sort('-createdAt');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    mongooseQuery = mongooseQuery.skip(skip).limit(limitNum);

    const [books, total] = await Promise.all([
      mongooseQuery.exec(),
      Book.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      isPopulated: shouldPopulate,
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
 * Requirement 3: getById with Deep Nested Population
 * Populates: Author, Category, and Reviews -> User (2-level deep population)
 * GET /api/books/:id
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `ID '${id}' is not a valid ObjectId.`,
      });
    }

    // =========================================================================
    // Requirement 3: Nested (deep) population: Book -> Reviews -> User
    // =========================================================================
    const book = await Book.findById(id)
      .populate({ path: 'author', select: 'name bio nationality website birthYear' })
      .populate({ path: 'category', select: 'name slug description' })
      .populate({
        path: 'reviews',
        select: 'rating comment isVerifiedPurchase createdAt user',
        // Deep populate: Hydrate the user reference inside each review sub-document
        populate: {
          path: 'user',
          select: 'username fullName email avatar role',
        },
      });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book with ID '${id}' not found.`,
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
 * Requirement 3: Advanced Population Options: match & options
 * Demonstrates:
 * - `match`: only populate reviews meeting filter criteria (e.g. minRating)
 * - `options`: sort by rating/date and limit populated items
 * GET /api/books/:id/reviews
 */
export const getBookReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { minRating, limit = 5, sort = '-rating' } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `ID '${id}' is not a valid ObjectId.`,
      });
    }

    // Build match condition
    const matchCondition = {};
    if (minRating !== undefined && minRating !== '') {
      matchCondition.rating = { $gte: Number(minRating) };
    }

    // Populate reviews with match, options, and deep user populate
    const book = await Book.findById(id).populate({
      path: 'reviews',
      match: matchCondition, // Requirement 3: match option
      options: {
        sort: sort.split(',').join(' '), // Requirement 3: options.sort
        limit: parseInt(limit, 10) || 5, // Requirement 3: options.limit
      },
      populate: {
        path: 'user',
        select: 'username fullName avatar',
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      bookId: book._id,
      bookTitle: book.title,
      filterApplied: { matchCondition, sort, limit: Number(limit) },
      reviewCount: book.reviews ? book.reviews.length : 0,
      data: book.reviews || [],
      // Explanation for report & client:
      explanation:
        'When match option is applied, Mongoose executes an additional query filtering children. Unmatched child documents are excluded from the array.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Book
 * POST /api/books
 */
export const create = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    // Populate before returning response
    const populated = await Book.findById(book._id)
      .populate('author', 'name bio')
      .populate('category', 'name slug');

    return res.status(201).json({
      success: true,
      message: 'Book created successfully with references',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing Book
 * PUT /api/books/:id
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `ID '${id}' is not a valid ObjectId.`,
      });
    }

    const updated = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('author', 'name bio')
      .populate('category', 'name slug');

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Book
 * DELETE /api/books/:id
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `ID '${id}' is not a valid ObjectId.`,
      });
    }

    const deleted = await Book.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Book with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Book '${deleted.title}' was deleted successfully.`,
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
