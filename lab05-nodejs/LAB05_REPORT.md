# LAB 05 REPORT: MONGOOSE ODM: SCHEMA, MODEL, VALIDATION AND MIDDLEWARE

- **Course**: SDN302 - Server-side Development with NodeJS, Express and MongoDB
- **Lab**: Lab 05 - Mongoose ODM: Schema, Model, Validation and Middleware
- **Case Study**: BookNest Online Bookstore
- **Student**: Nguyen Le Quang Trung (DS190284)
- **Date**: 2026-09-29

---

## 1. Objectives & Theoretical Foundations

### 1.1 What is an ODM (Object Data Modeling) Library?
- MongoDB is inherently a schemaless document database. While this provides maximum agility during development, enterprise backend applications require strict data integrity, type safety, relationship management, and standardized business rules.
- **Mongoose** is an **Object Data Modeling (ODM)** library for Node.js and MongoDB. It acts as an abstraction layer between the Node.js application and the MongoDB database driver.
- **Key benefits of using Mongoose over the native driver**:
  1. **Schema Definition**: Enforces strict schemas and data contracts at the application layer while preserving MongoDB's underlying document flexibility.
  2. **Type Casting**: Automatically casts input data into defined schema types (e.g., string to Number, string to Date, or string to ObjectId).
  3. **Built-in & Custom Validation**: Enforces validations (required fields, value ranges, regex patterns, enum lists, and custom business functions) *before* data reaches the database.
  4. **Middleware (Hooks)**: Provides lifecycle interceptors (`pre` and `post` hooks on save, update, delete) to automate workflows such as slug generation, password hashing, auditing, and cascading operations.
  5. **Instance & Static Methods**: Encapsulates domain logic directly onto models and document instances.
  6. **Virtual Properties**: Exposes computed properties dynamically without persisting redundant fields in the database.

---

### 1.2 Comparison: Raw MongoDB Driver vs. Mongoose ODM

| Feature | Raw MongoDB Driver (Lab 04) | Mongoose ODM (Lab 05) |
| :--- | :--- | :--- |
| **Schema Enforcement** | None (documents in the same collection can have arbitrary shapes) | Strict Schema defined with Mongoose `Schema` |
| **Data Validation** | Manual validation logic in route handlers / controllers | Declarative built-in and custom validators on schema fields |
| **Type Casting** | Must manually cast (e.g., `new ObjectId(id)`, `new Date(d)`) | Automatic casting based on schema definitions |
| **Lifecycle Hooks** | Not natively supported | `pre('save')`, `post('save')`, query middleware |
| **Computed Fields** | Must calculate manually in each query handler | First-class **Virtual Properties** (`get` / `set`) |
| **Domain Logic** | Procedural helper functions | Object-Oriented **Instance Methods** and **Static Methods** |

---

### 1.3 The MVC Architecture in Express & Mongoose
The project strictly implements the **Model-View-Controller (MVC)** architectural pattern:
- **`config/`**: Configuration files (e.g., database connection lifecycle, environment variable bindings).
- **`models/`**: Data layer definitions (`Book.js`, `Category.js`) containing Mongoose schemas, validation rules, hooks, methods, and virtuals.
- **`controllers/`**: Application business logic (`bookController.js`, `categoryController.js`) processing client requests, executing Mongoose queries, and assembling responses.
- **`routes/`**: Endpoint routing declarations (`bookRouter.js`, `categoryRouter.js`) mapping HTTP verbs and URL paths to corresponding controller handlers.
- **`middlewares/`**: Centralized cross-cutting concerns (`logger.js` for latency tracking, `errorHandler.js` for intercepting ValidationError, CastError, and 11000 duplicate keys).

```
lab05-nodejs/
├── .env                  # Environment configuration (ignored in Git)
├── .env.example          # Environment template for repository
├── .gitignore            # Git exclusion rules
├── package.json          # Project metadata, ES Module declaration, scripts
├── config/
│   └── db.js             # Mongoose connection & graceful error shutdown (Req 1)
├── models/
│   ├── Book.js           # Book schema, 5 types, 7 validators, hooks, methods, virtuals (Req 2, 4, 5)
│   └── Category.js       # Category model for catalog organization and Lab 06 reuse (Req 2)
├── controllers/
│   ├── bookController.js # CRUD handlers, queries with select/sort/limit, methods (Req 3, 5)
│   └── categoryController.js # Category CRUD handlers
├── routes/
│   ├── bookRouter.js     # Express routes for /api/books (Req 3, 5)
│   └── categoryRouter.js # Express routes for /api/categories
├── middlewares/
│   ├── logger.js         # HTTP latency logger
│   └── errorHandler.js   # Central error handler: ValidationError, CastError, 11000 (Req 4)
├── index.js              # Server entry point, middleware assembly, graceful shutdown
├── seed.js               # Database seeding script with realistic data
└── testLab05.js          # Automated verification test suite (56/56 passing tests)
```

---

## 2. Requirement 1: Database Connection & MVC Structure (15%)

### 2.1 Mongoose Connection Lifecycle (`config/db.js`)
The database connection module uses `mongoose.connect()` with `serverSelectionTimeoutMS: 5000` to prevent infinite hangs.
In accordance with Requirement 1:
- A clear success message is logged containing the connected host and database name:
  `[db.js] ✔ MongoDB Connected successfully: 127.0.0.1/booknest_mongoose`
- When the database is unreachable, a clear failure message is logged and the application exits gracefully using `process.exit(1)`.

```javascript
// config/db.js
export const connectDB = async (customUri = null) => {
  const uri = customUri || MONGODB_URI;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[db.js] ✔ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[db.js] ✖ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'test' || process.env.DONT_EXIT_ON_DB_FAIL === 'true') {
      throw error;
    }
    console.error('[db.js] Exiting application gracefully due to database connection failure...');
    process.exit(1);
  }
};
```

---

## 3. Requirement 2: Book Schema, 5 Types, 7 Validators & Category Model

### 3.1 5 Data Types Covered in `Book` Schema
1. **`String`**: `title`, `author`, `isbn`, `category`, `description`, `slug`
2. **`Number`**: `price`, `quantity`, `publishedYear`
3. **`Date`**: `publishedDate`
4. **`Boolean`**: `inStock`, `isFeatured`
5. **`Array`**: `tags` (`[String]`)

### 3.2 7 Schema Validators Implemented

| # | Validator | Field | Configuration / Behavior |
| :---: | :--- | :--- | :--- |
| **1** | `required` | `title`, `author`, `price`, `isbn`, `category` | Document rejected if missing; returns custom message: `'Book title is required'` |
| **2** | `default` | `inStock` (default `true`), `quantity` (default `0`), `tags` (default `[]`) | Automatically assigns default value when field is omitted |
| **3** | `enum` | `category` | Restricts values to `['Software Engineering', 'Programming', 'DevOps', 'Architecture', 'Computer Science', 'Web Development', 'Database']`. Custom error: `'{VALUE} is not a supported book category'` |
| **4** | `min` | `price`, `quantity` | `price: { min: [0, 'Price must be a positive number (minimum 0)'] }` |
| **5** | `max` | `quantity` | `quantity: { max: [9999, 'Quantity cannot exceed 9999 units'] }` |
| **6** | `minlength` | `title` | `minlength: [3, 'Book title must be at least 3 characters long']` |
| **7** | `unique` | `isbn` | Enforces unique index in MongoDB; prevents duplicate ISBN entries |

### 3.3 Timestamps & Custom Error Messages
- `timestamps: true` is enabled on both `Book` and `Category` schemas, automatically tracking `createdAt` and `updatedAt`.
- Custom error messages are configured across validators:
  - `minlength` on `title`: `'Book title must be at least 3 characters long'`
  - `enum` on `category`: `'{VALUE} is not a supported book category'`
  - `min` on `price`: `'Price must be a positive number (minimum 0)'`

### 3.4 Second Model: `Category` (`models/Category.js`)
Prepared for catalog management and ready for reuse in Lab 06 (Relations & Population):
- `name`: String, required, unique, trim, minlength: 2
- `description`: String, trim
- `slug`: String, lowercase, auto-generated via pre-save hook
- `isActive`: Boolean, default: true
- `timestamps: true`

---

## 4. Requirement 3: CRUD Operations with Mongoose Queries

### 4.1 Controller Operations Overview

| Operation | Controller Function | HTTP Verb | Route | Mongoose Method Used |
| :--- | :--- | :--- | :--- | :--- |
| **Create** | `create` | `POST` | `/api/books` | `Book.create(req.body)` |
| **Read All** | `getAll` | `GET` | `/api/books` | `Book.find(query).select().sort().limit().skip()` |
| **Read By ID** | `getById` | `GET` | `/api/books/:id` | `Book.findById(id)` |
| **Update** | `update` | `PUT` | `/api/books/:id` | `Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })` |
| **Delete** | `remove` | `DELETE` | `/api/books/:id` | `Book.findByIdAndDelete(id)` |

### 4.2 Query Enhancements: `find()`, `select()`, `sort()`, `limit()`, `skip()`
The `getAll` endpoint supports query strings for filtering and projection:
```javascript
// Query builder in controllers/bookController.js
let mongooseQuery = Book.find(query);

if (select) {
  // e.g. ?select=title,price,category -> "title price category"
  mongooseQuery = mongooseQuery.select(select.split(',').join(' '));
}

if (sort) {
  // e.g. ?sort=-price -> sorts descending by price
  mongooseQuery = mongooseQuery.sort(sort.split(',').join(' '));
} else {
  mongooseQuery = mongooseQuery.sort('-createdAt');
}

const pageNum = Math.max(1, parseInt(page, 10) || 1);
const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
const skip = (pageNum - 1) * limitNum;

mongooseQuery = mongooseQuery.skip(skip).limit(limitNum);
```

### 4.3 Why `{ new: true, runValidators: true }` Matters in `findByIdAndUpdate`
In Mongoose, calling `findByIdAndUpdate(id, updateData)` without options introduces two critical issues:

1. **Why `new: true` is essential**:
   - By default, Mongoose returns the original document *as it existed before the update was applied*.
   - Setting `new: true` instructs Mongoose to return the modified document *after* the update has been saved to the database.
   - For an API endpoint, returning the outdated document confuses client applications and frontend state.

2. **Why `runValidators: true` is essential**:
   - By default, Mongoose executes schema validators (`min`, `max`, `enum`, custom validators) **only** during document creation (`.save()` or `.create()`).
   - Standard update queries (`findByIdAndUpdate`, `updateOne`) bypass validation checks by default for performance reasons.
   - Without `runValidators: true`, a client could send `{ price: -999 }` or `{ category: "InvalidCategory" }` in a `PUT` request, successfully bypassing schema constraints and corrupting the database.
   - Explicitly passing `runValidators: true` ensures every update operation adheres to the same schema integrity rules as creation.

### 4.4 400 Bad Request vs. 404 Not Found Handling
- **400 Bad Request**: Triggered when the URL parameter `:id` is not a valid 24-character hexadecimal MongoDB `ObjectId` (e.g. `/api/books/invalid-id-12345`).
- **404 Not Found**: Triggered when the identifier is a valid `ObjectId` format, but no matching document exists in the collection (e.g. `/api/books/507f1f77bcf86cd799439011`).

---

## 5. Requirement 4: Custom Validation & Central Error Handling

### 5.1 Custom Validators Implemented in `Book` Schema

1. **Published Year Validator (Year cannot be in the future)**:
```javascript
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
}
```

2. **ISBN Format Validator (Regex Pattern Check)**:
```javascript
isbn: {
  type: String,
  required: [true, 'ISBN is required'],
  unique: true,
  validate: {
    validator: function (v) {
      if (!v) return false;
      return /^(978|979)?[- ]?\d{1,5}[- ]?\d{1,7}[- ]?\d{1,7}[- ]?[\dX]$/i.test(v);
    },
    message: (props) => `Invalid ISBN format: '${props.value}'. Must be a valid 10- or 13-digit ISBN format.`,
  },
}
```

### 5.2 Central Error Handler (`middlewares/errorHandler.js`)
Intercepts all errors centrally and maps Mongoose internal errors to client-friendly JSON payloads:

1. **`ValidationError`** (Schema constraint violations):
```json
{
  "success": false,
  "error": "Validation Error",
  "statusCode": 400,
  "message": "Document validation failed. Please check the provided fields.",
  "invalidFields": {
    "publishedYear": "Published year (2099) cannot be in the future (current year: 2026) and must be >= 1440"
  },
  "errors": [
    "Published year (2099) cannot be in the future (current year: 2026) and must be >= 1440"
  ]
}
```

2. **`CastError`** (Malformed `ObjectId`):
```json
{
  "success": false,
  "error": "Invalid Identifier",
  "statusCode": 400,
  "message": "Invalid identifier format: 'invalid-id-12345'. Expected a valid 24-character hex MongoDB ObjectId."
}
```

3. **Duplicate Key Error (`code: 11000`)** (Unique constraint violation):
```json
{
  "success": false,
  "error": "Duplicate Key Conflict",
  "statusCode": 400,
  "message": "Duplicate key error: A record with isbn '978-0132350884' already exists."
}
```

---

## 6. Requirement 5: Schema Middleware, Methods & Virtuals

### 6.1 Schema Middleware (Hooks)
- **`pre('save')` Hook**:
  - Trims title and collapses internal whitespace.
  - Automatically generates a URL-friendly slug whenever the title is set or updated.
  - Synchronizes `inStock` with `quantity > 0`.
```javascript
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
```

- **`post('save')` Hook**:
  - Logs the newly created or updated document's `_id`, `title`, and `slug` to the console:
```javascript
bookSchema.post('save', function (doc) {
  console.log(`[Book Model Hook] Document saved - ID: ${doc._id}, Title: "${doc.title}", Slug: "${doc.slug}"`);
});
```

### 6.2 Schema Methods
- **Instance Method: `getSummary()`**:
  - Operates on a single document instance.
  - Returns a formatted summary string.
```javascript
bookSchema.methods.getSummary = function () {
  return `"${this.title}" by ${this.author} | Price: ${this.formattedPrice} | Category: ${this.category} | In Stock: ${this.inStock ? 'Yes' : 'No'}`;
};
```
  - Exposed via endpoint: `GET /api/books/:id/summary`

- **Static Method: `findByCategory(categoryName)`**:
  - Operates on the entire `Book` model.
  - Finds all in-stock books in the given category, sorted by price ascending:
```javascript
bookSchema.statics.findByCategory = function (categoryName) {
  return this.find({
    category: new RegExp(`^${categoryName}$`, 'i'),
    inStock: true,
  }).sort({ price: 1 });
};
```
  - Exposed via endpoint: `GET /api/books/by-category/:category`

### 6.3 Virtual Property: `formattedPrice`
- Computed on the fly without storing duplicate currency strings in the database.
- Included in JSON responses via `{ toJSON: { virtuals: true } }`:
```javascript
bookSchema.virtual('formattedPrice').get(function () {
  if (typeof this.price === 'number') {
    return `$${this.price.toFixed(2)}`;
  }
  return '$0.00';
});
```

---

## 7. Automated Test Suite Execution

The automated test runner (`testLab05.js`) tests all 5 requirements in an isolated test environment:

```
================================================================
  🚀 BOOKNEST LAB 05 - MONGOOSE ODM TEST SUITE
  Student: Nguyen Le Quang Trung (DS190284)
================================================================

--- [Requirement 1] MVC Folder Structure & DB Setup ---
  ✔ PASS: Folder 'config/' exists
  ✔ PASS: Folder 'models/' exists
  ✔ PASS: Folder 'controllers/' exists
  ✔ PASS: Folder 'routes/' exists
  ✔ PASS: Folder 'middlewares/' exists
  ✔ PASS: File 'config/db.js' exists
  ✔ PASS: File '.env.example' exists
  ✔ PASS: connectDB connects successfully to MongoDB

--- [Requirement 2] Book Schema & Category Model ---
  ✔ PASS: Category model is imported and defined
  ✔ PASS: Category schema has required name field
  ✔ PASS: Category schema has slug field
  ✔ PASS: Category schema has isActive field
  ✔ PASS: Category pre-save hook generated slug
  ✔ PASS: Type 1 (String): 'title' is String
  ✔ PASS: Type 2 (Number): 'price' is Number
  ✔ PASS: Type 3 (Date): 'publishedDate' is Date
  ✔ PASS: Type 4 (Boolean): 'inStock' is Boolean
  ✔ PASS: Type 5 (Array): 'tags' is Array
  ✔ PASS: Validator 1 (required): 'title' is required
  ✔ PASS: Validator 2 (default): 'inStock' default is true
  ✔ PASS: Validator 3 (enum): 'category' defines enum values
  ✔ PASS: Validator 4 (min): 'price' defines min validator
  ✔ PASS: Validator 5 (max): 'quantity' defines max validator
  ✔ PASS: Validator 6 (minlength): 'title' defines minlength validator
  ✔ PASS: Validator 7 (unique): 'isbn' defines unique index
  ✔ PASS: Book schema has timestamps enabled (createdAt & updatedAt)
  ✔ PASS: Custom error message defined for minlength validator

--- [Requirement 4] Custom Validation & Error Handling ---
  ✔ PASS: Custom validator blocks future publishedYear (Status 400)
  ✔ PASS: Central error handler returns formatted invalidFields for publishedYear
  ✔ PASS: Custom validator blocks invalid ISBN format (Status 400)
  ✔ PASS: Central error handler returns readable error message for invalid ISBN

--- [Requirement 5] Schema Middleware, Methods, and Virtuals ---
  ✔ PASS: POST /api/books creates book successfully (Status 201)
  ✔ PASS: pre('save') hook generates correct URL-friendly slug
  ✔ PASS: Virtual property formattedPrice returns correct format ($37.50, got: $37.50)
  ✔ PASS: GET /api/books/:id/summary calls instance method (Status 200)
  ✔ PASS: Instance method returns rich summary string
  ✔ PASS: POST /api/books creates 2nd book
  ✔ PASS: GET /api/books/by-category/:category calls static method (Status 200)
  ✔ PASS: Static method findByCategory returns all books in category (expected: 2, got: 2)
  ✔ PASS: Duplicate ISBN returns 400 error via central errorHandler
  ✔ PASS: Central error handler properly maps 11000 duplicate key error

--- [Requirement 3] CRUD Operations with Mongoose Queries ---
  ✔ PASS: GET /api/books with query parameters returns 200
  ✔ PASS: limit=1 restricts returned items to 1
  ✔ PASS: Total matching count reflects total in DB
  ✔ PASS: sort=-price sorts correctly in descending order
  ✔ PASS: GET /api/books/:id with valid ObjectId returns 200
  ✔ PASS: Document returned matches requested ID
  ✔ PASS: GET /api/books/:id with invalid ObjectId returns 400
  ✔ PASS: Response includes statusCode 400
  ✔ PASS: GET /api/books/:id with non-existent ObjectId returns 404
  ✔ PASS: PUT /api/books/:id updates document (Status 200)
  ✔ PASS: Option { new: true } returned modified document with updated price $39.99
  ✔ PASS: Option { runValidators: true } catches invalid price < 0 on update query
  ✔ PASS: DELETE /api/books/:id removes document (Status 200)
  ✔ PASS: Deleted document cannot be retrieved (Status 404)
  ✔ PASS: Undefined route triggers 404 notFoundHandler

================================================================
  📊 TEST RESULTS SUMMARY: 56 PASSED, 0 FAILED (100% SUCCESS)
================================================================
```

---

## 8. MongoDB Compass Demonstration & Submission Evidence Guide

### 8.1 Step-by-Step Instructions to Connect Compass & Seed Data

1. **Start MongoDB / Prepare URI**:
   - If using local MongoDB: ensure MongoDB Community Server is started on `mongodb://127.0.0.1:27017`.
   - If using MongoDB Atlas: copy your Atlas connection string from MongoDB Atlas dashboard.
2. **Update `.env`**:
   - Open `lab05-nodejs/.env` and paste your connection string into `MONGODB_URI`:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/booknest_mongoose
     ```
3. **Run Database Seeding Script**:
   - In terminal, execute:
     ```bash
     npm run seed
     ```
   - Console logs will confirm:
     - 5 categories inserted with auto-generated slugs.
     - 12 books inserted triggering pre/post save hooks, validating all fields.
4. **Open MongoDB Compass**:
   - Paste the connection URI and click **Connect**.
   - Click the **Refresh** button on the left database list.
   - Locate database **`booknest_mongoose`**.

---

### 8.2 Submission Checklist of Screenshots for Document

| # | Requirement | Screen / View in MongoDB Compass | Key Content to Demonstrate |
| :---: | :--- | :--- | :--- |
| **1** | **Req 1** | Left navigation panel in MongoDB Compass | Database `booknest_mongoose` is visible, listing collections `books` and `categories`. |
| **2** | **Req 2** | `books` collection document view | Document containing all 5 types (`String`, `Number`, `Date`, `Boolean`, `Array`), `createdAt`, `updatedAt`, and auto-generated `slug`. |
| **3** | **Req 2** | `categories` collection document view | List of 5 categories (`Software Engineering`, `Programming`, `Architecture`, `DevOps`, `Computer Science`) with generated slugs. |
| **4** | **Req 3** | MongoDB Compass **Filter** bar on `books` | Enter `{ category: "Software Engineering", price: { $gte: 30 } }` and show the filtered results. |
| **5** | **Req 4** | VSCode / Terminal test output | Output showing custom validation blocking future year (`publishedYear: 2099`) and invalid ISBN. |
| **6** | **Req 5** | Compass view of `slug` field & Terminal `post('save')` log | Showing `slug` generated from `title` (e.g., `clean-code-...`) and console logs showing `[Book Model Hook] Document saved - ID: ...`. |

---

## 9. Conclusion
Lab 05 successfully elevates the BookNest Online Bookstore architecture from raw MongoDB driver queries to a structured, type-safe, maintainable enterprise MVC application using Mongoose ODM. All 5 core requirements, along with comprehensive error handling, schema hooks, custom validators, methods, and virtuals, have been fully implemented and verified with 100% test pass rate.
