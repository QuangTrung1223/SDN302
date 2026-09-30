/**
 * Review Controller (Requirements 1 & 3: Reviews with User & Book Population)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import User from '../models/User.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAllReviews = async (req, res, next) => {
  try {
    const { bookId, userId, minRating } = req.query;
    const query = {};

    if (bookId && isValidObjectId(bookId)) query.book = bookId;
    if (userId && isValidObjectId(userId)) query.user = userId;
    if (minRating) query.rating = { $gte: Number(minRating) };

    const reviews = await Review.find(query)
      .populate('user', 'username fullName avatar')
      .populate('book', 'title slug price formattedPrice')
      .sort('-createdAt');

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Review ID '${id}' is not a valid ObjectId.`,
      });
    }

    const review = await Review.findById(id)
      .populate('user', 'username fullName email avatar')
      .populate('book', 'title author category price');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Review with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { book, user, rating, comment } = req.body;

    if (!isValidObjectId(book)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: 'A valid Book ObjectId is required.',
      });
    }

    if (!isValidObjectId(user)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: 'A valid User ObjectId is required.',
      });
    }

    // Verify both referenced entities exist
    const [bookExists, userExists] = await Promise.all([
      Book.findById(book),
      User.findById(user),
    ]);

    if (!bookExists) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Referenced Book with ID '${book}' does not exist.`,
      });
    }

    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Referenced User with ID '${user}' does not exist.`,
      });
    }

    const review = await Review.create({ book, user, rating, comment });
    const populated = await Review.findById(review._id)
      .populate('user', 'username fullName avatar')
      .populate('book', 'title slug');

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Review ID '${id}' is not a valid ObjectId.`,
      });
    }

    const deleted = await Review.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Review with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
