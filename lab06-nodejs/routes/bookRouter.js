/**
 * Book Router (Requirements 1, 2, 3)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getBookReviews,
} from '../controllers/bookController.js';

const router = express.Router();

// Requirement 3: Advanced Population Options (match & options)
router.get('/:id/reviews', getBookReviews);

// Core CRUD routes
router.route('/')
  .get(getAll)     // Requirement 2: Two-path population with select
  .post(create);

router.route('/:id')
  .get(getById)    // Requirement 3: Deep nested population (Book -> Reviews -> User)
  .put(update)
  .delete(remove);

export default router;
