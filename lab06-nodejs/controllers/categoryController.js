/**
 * Category Controller (Requirement 1 & Requirement 3: Virtual Populate)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import Category from '../models/Category.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAllCategories = async (req, res, next) => {
  try {
    const { populateBooks = 'false' } = req.query;

    let query = Category.find().sort('name');

    if (populateBooks === 'true') {
      query = query.populate({
        path: 'books',
        select: 'title price formattedPrice inStock publishedYear slug',
      });
    }

    const categories = await query.exec();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: getCategoryById with Virtual Populate
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Category ID '${id}' is not a valid ObjectId.`,
      });
    }

    const category = await Category.findById(id).populate({
      path: 'books',
      select: 'title price formattedPrice inStock publishedYear slug author',
      populate: { path: 'author', select: 'name bio' },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Category with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      virtualPopulated: true,
      bookCount: category.books ? category.books.length : 0,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 3: Dedicated Virtual Populate Endpoint for Category Books
 * GET /api/categories/:id/books
 */
export const getCategoryBooks = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Category ID '${id}' is not a valid ObjectId.`,
      });
    }

    const category = await Category.findById(id).populate({
      path: 'books',
      select: 'title price formattedPrice inStock publishedYear slug author',
      populate: { path: 'author', select: 'name bio' },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Category with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      categoryName: category.name,
      totalBooks: category.books ? category.books.length : 0,
      data: category.books || [],
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Category ID '${id}' is not a valid ObjectId.`,
      });
    }

    const updated = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Category with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Category ID '${id}' is not a valid ObjectId.`,
      });
    }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Category with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Category '${deleted.name}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
