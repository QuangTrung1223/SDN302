/**
 * Book Router (Requirements 3 & 5)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getByCategory,
  getSummary,
} from '../controllers/bookController.js';

const router = express.Router();

// Specific routes must come BEFORE parameterized /:id routes to avoid matching conflicts

// Requirement 5: Static Method route (findByCategory)
router.get('/by-category/:category', getByCategory);

// Requirement 5: Instance Method route (getSummary)
router.get('/:id/summary', getSummary);

// Requirement 3: Core CRUD routes
router.route('/')
  .get(getAll)     // find() with query, select, sort, limit
  .post(create);   // create() with schema validation & pre/post hooks

router.route('/:id')
  .get(getById)    // findById() with 400/404 handling
  .put(update)     // findByIdAndUpdate() with { new: true, runValidators: true }
  .delete(remove); // findByIdAndDelete() with 400/404 handling

export default router;
