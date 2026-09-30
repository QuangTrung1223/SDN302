/**
 * Book Model (Requirement 1, 2, 3: References Author, Category, and Virtual Reviews)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 06 - Managing Relationships with Mongoose Population
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      minlength: [3, 'Book title must be at least 3 characters long'],
      maxlength: [200, 'Book title cannot exceed 200 characters'],
      trim: true,
    },
    // Requirement 1: Reference to Author model with ObjectId and ref
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Author reference is required'],
      index: true,
    },
    // Requirement 1: Reference to Category model with ObjectId and ref
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
          return /^(978|979)?[- ]?\d{1,5}[- ]?\d{1,7}[- ]?\d{1,7}[- ]?[\dX]$/i.test(v);
        },
        message: (props) => `Invalid ISBN format: '${props.value}'. Must be a valid 10- or 13-digit ISBN format.`,
      },
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number (minimum 0)'],
      max: [5000, 'Price cannot exceed $5000'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
      max: [9999, 'Quantity cannot exceed 9999 units'],
    },
    publishedYear: {
      type: Number,
      validate: {
        validator: function (v) {
          if (v === undefined || v === null) return true;
          const currentYear = new Date().getFullYear();
          return Number.isInteger(v) && v <= currentYear && v >= 1440;
        },
        message: (props) =>
          `Published year (${props.value}) cannot be in the future (current year: ${new Date().getFullYear()}) and must be >= 1440`,
      },
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for formatted price
bookSchema.virtual('formattedPrice').get(function () {
  if (typeof this.price === 'number') {
    return `$${this.price.toFixed(2)}`;
  }
  return '$0.00';
});

// =========================================================================
// Requirement 3: Virtual Populate for Reviews
// Enables book.populate('reviews') without storing an array of review IDs
// =========================================================================
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
});

// Pre-save hook: title normalization and slug generation
bookSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.title = this.title.trim().replace(/\s+/g, ' ');
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (this.isModified('quantity')) {
    this.inStock = this.quantity > 0;
  }

  next();
});

// Post-save hook: logging
bookSchema.post('save', function (doc) {
  console.log(`[Book Model Hook] Saved - ID: ${doc._id}, Title: "${doc.title}", Slug: "${doc.slug}"`);
});

// Instance method: summary
bookSchema.methods.getSummary = function () {
  const authorName = this.author?.name || this.author || 'Unknown Author';
  const categoryName = this.category?.name || this.category || 'General';
  return `"${this.title}" by ${authorName} | Price: ${this.formattedPrice} | Category: ${categoryName} | In Stock: ${this.inStock ? 'Yes' : 'No'}`;
};

const Book = mongoose.model('Book', bookSchema);

export default Book;
