/**
 * Category Model (Requirement 1 & Requirement 3: Virtual Populate)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [60, 'Category name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    isActive: {
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

// Pre-save hook: auto-generate URL slug
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// =========================================================================
// Requirement 3: Virtual Populate
// Enables category.populate('books') without storing an array of book IDs
// =========================================================================
categorySchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'category',
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
