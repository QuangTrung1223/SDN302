/**
 * Category Controller (Requirement 2)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';
import Category from '../models/Category.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Identifier',
        message: `Category ID '${id}' is not a valid ObjectId.`,
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Category with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
      message: `Category '${deleted.name}' deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
