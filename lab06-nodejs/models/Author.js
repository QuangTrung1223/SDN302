/**
 * Author Model (Requirement 1 & Requirement 3: Virtual Populate)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters long'],
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    nationality: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    birthYear: {
      type: Number,
      min: [1800, 'Birth year must be after 1800'],
      max: [new Date().getFullYear(), 'Birth year cannot be in the future'],
    },
    country: {
      type: String,
      trim: true,
      default: 'United States',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =========================================================================
// Requirement 3: Virtual Populate
// Declares relationship without storing an array of book IDs on the Author document
// =========================================================================
authorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'author',
});

const Author = mongoose.model('Author', authorSchema);

export default Author;
