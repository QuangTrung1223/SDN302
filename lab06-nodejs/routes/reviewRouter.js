/**
 * Review Router (Requirements 1 & 3: Reviews with User Population)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import express from 'express';
import {
  getAllReviews,
  getReviewById,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.route('/')
  .get(getAllReviews)
  .post(createReview);

router.route('/:id')
  .get(getReviewById)
  .delete(deleteReview);

export default router;
