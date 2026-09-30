/**
 * Review Model (Requirement 1 & Requirement 3: Deep Nested Population)
 * References both Book and User models
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required for a review'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for a review'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [5, 'Review comment must be at least 5 characters long'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
