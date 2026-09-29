/**
 * Book Model (Requirements 2, 4, 5)
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
 * Student: Nguyen Le Quang Trung (DS190284)
 */

import mongoose from 'mongoose';

/**
 * Requirement 2: Schema definition covering:
 * - 5 Types: String, Number, Date, Boolean, Array
 * - 7 Validators: required, default, enum, min, max, minlength, unique
 * - Timestamps: true
 * - Custom error messages for validators
 * Requirement 4:
 * - Custom validators: publishedYear (not in future), ISBN format regex
 * Requirement 5:
 * - Virtual property: formattedPrice
 * - pre('save') hook: normalize title and generate slug
 * - post('save') hook: log document _id
 * - instance method: getSummary()
 * - static method: findByCategory()
 */
const bookSchema = new mongoose.Schema(
  {
    // Type 1: String fields
    title: {
      type: String,
      required: [true, 'Book title is required'], // Validator 1: required (custom message)
      minlength: [3, 'Book title must be at least 3 characters long'], // Validator 2: minlength (custom message)
      maxlength: [200, 'Book title cannot exceed 200 characters'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters long'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true, // Validator 3: unique
      trim: true,
      // Requirement 4: Custom Validator - ISBN pattern check
      validate: {
        validator: function (v) {
          if (!v) return false;
          // Validates ISBN-10 or ISBN-13 format with optional hyphens/spaces
          return /^(978|979)?[- ]?\d{1,5}[- ]?\d{1,7}[- ]?\d{1,7}[- ]?[\dX]$/i.test(v);
        },
        message: (props) => `Invalid ISBN format: '${props.value}'. Must be a valid 10- or 13-digit ISBN format.`,
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      // Validator 4: enum with custom error message
      enum: {
        values: [
          'Software Engineering',
          'Programming',
          'DevOps',
          'Architecture',
          'Computer Science',
          'Web Development',
          'Database',
        ],
        message: "'{VALUE}' is not a supported book category",
      },
      trim: true,
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

    // Type 2: Number fields
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number (minimum 0)'], // Validator 5: min
      max: [5000, 'Price cannot exceed $5000'],
    },
    quantity: {
      type: Number,
      default: 0, // Validator 6: default
      min: [0, 'Quantity cannot be negative'],
      max: [9999, 'Quantity cannot exceed 9999 units'], // Validator 7: max
    },
    publishedYear: {
      type: Number,
      // Requirement 4: Custom Validator - year cannot be in the future
      validate: {
        validator: function (v) {
          if (v === undefined || v === null) return true;
          const currentYear = new Date().getFullYear();
          return Number.isInteger(v) && v <= currentYear && v >= 1440; // 1440: Gutenberg printing press
        },
        message: (props) =>
          `Published year (${props.value}) cannot be in the future (current year: ${new Date().getFullYear()}) and must be >= 1440`,
      },
    },

    // Type 3: Date field
    publishedDate: {
      type: Date,
      default: Date.now,
    },

    // Type 4: Boolean fields
    inStock: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Type 5: Array field
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Requirement 2: Timestamps enabled
    toJSON: { virtuals: true }, // Enable virtuals when document is converted to JSON
    toObject: { virtuals: true },
  }
);

// =========================================================================
// Requirement 5: Virtual Property
// Not stored in MongoDB, computed dynamically on demand
// =========================================================================
bookSchema.virtual('formattedPrice').get(function () {
  if (typeof this.price === 'number') {
    return `$${this.price.toFixed(2)}`;
  }
  return '$0.00';
});

// =========================================================================
// Requirement 5: Schema Middleware (Hooks)
// =========================================================================

// pre('save') hook: normalizes title and automatically generates slug
bookSchema.pre('save', function (next) {
  // If title was modified or slug is missing, generate slug
  if (this.isModified('title') || !this.slug) {
    // Normalize title: trim extra whitespace and collapse internal multi-spaces
    this.title = this.title.trim().replace(/\s+/g, ' ');

    // Generate URL-friendly slug
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Update inStock automatically based on quantity
  if (this.isModified('quantity')) {
    this.inStock = this.quantity > 0;
  }

  next();
});

// post('save') hook: logs the identifier of the newly created or updated document
bookSchema.post('save', function (doc) {
  console.log(`[Book Model Hook] Document saved - ID: ${doc._id}, Title: "${doc.title}", Slug: "${doc.slug}"`);
});

// =========================================================================
// Requirement 5: Schema Methods
// =========================================================================

/**
 * Instance Method: Returns a readable summary string for this specific book
 * @returns {string}
 */
bookSchema.methods.getSummary = function () {
  return `"${this.title}" by ${this.author} | Price: ${this.formattedPrice} | Category: ${this.category} | In Stock: ${this.inStock ? 'Yes' : 'No'}`;
};

/**
 * Static Method: Finds in-stock books by category, sorted by price ascending
 * @param {string} categoryName
 * @returns {Promise<Array>}
 */
bookSchema.statics.findByCategory = function (categoryName) {
  return this.find({
    category: new RegExp(`^${categoryName}$`, 'i'),
    inStock: true,
  }).sort({ price: 1 });
};

const Book = mongoose.model('Book', bookSchema);

export default Book;
