/**
 * Category Router (Requirements 1 & 3: Virtual Populate)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  getCategoryBooks,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

// Requirement 3: Dedicated Virtual Populate Endpoint for Category Books
router.get('/:id/books', getCategoryBooks);

router.route('/')
  .get(getAllCategories)
  .post(createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
