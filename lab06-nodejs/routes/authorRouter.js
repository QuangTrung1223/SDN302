/**
 * Author Router (Requirements 1 & 3: Virtual Populate)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import {
  getAllAuthors,
  getAuthorById,
  getAuthorBooks,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../controllers/authorController.js';

const router = express.Router();

// Requirement 3: Dedicated Virtual Populate Endpoint for Author Books
router.get('/:id/books', getAuthorBooks);

router.route('/')
  .get(getAllAuthors)
  .post(createAuthor);

router.route('/:id')
  .get(getAuthorById) // Requirement 3: Virtual Populate 'books'
  .put(updateAuthor)
  .delete(deleteAuthor);

export default router;
