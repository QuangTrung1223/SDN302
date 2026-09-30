/**
 * Author Controller (Requirement 1 & Requirement 3: Virtual Populate)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import Author from '../models/Author.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAllAuthors = async (req, res, next) => {
  try {
    const { populateBooks = 'false' } = req.query;

    let query = Author.find().sort('name');

    // Requirement 3: Virtual Populate on Author
    if (populateBooks === 'true') {
      query = query.populate({
        path: 'books',
        select: 'title price formattedPrice inStock publishedYear slug',
      });
    }

    const authors = await query.exec();

    return res.status(200).json({
      success: true,
      count: authors.length,
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: getAuthorById with Virtual Populate
 * Populates virtual 'books' field without an array of book IDs stored on Author
 * GET /api/authors/:id
 */
export const getAuthorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Author ID '${id}' is not a valid ObjectId.`,
      });
    }

    // Virtual Populate for books written by this author
    const author = await Author.findById(id).populate({
      path: 'books',
      select: 'title price formattedPrice inStock publishedYear slug category',
      populate: { path: 'category', select: 'name slug' },
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Author with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      virtualPopulated: true,
      bookCount: author.books ? author.books.length : 0,
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: Dedicated Virtual Populate Endpoint for Author Books
 * GET /api/authors/:id/books
 */
export const getAuthorBooks = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Author ID '${id}' is not a valid ObjectId.`,
      });
    }

    const author = await Author.findById(id).populate({
      path: 'books',
      select: 'title price formattedPrice inStock publishedYear slug category isbn description',
      populate: { path: 'category', select: 'name slug' },
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Author with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      authorName: author.name,
      authorId: author._id,
      totalBooks: author.books ? author.books.length : 0,
      data: author.books || [],
    });
  } catch (error) {
    next(error);
  }
};

export const createAuthor = async (req, res, next) => {
  try {
    const author = await Author.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Author created successfully',
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Author ID '${id}' is not a valid ObjectId.`,
      });
    }

    const updated = await Author.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Author with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Author updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Author ID '${id}' is not a valid ObjectId.`,
      });
    }

    const deleted = await Author.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Author with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Author '${deleted.name}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
