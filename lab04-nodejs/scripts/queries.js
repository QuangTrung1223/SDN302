/**
 * BookNest Online Bookstore - Requirement 2 mongosh Queries
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 *
 * Usage:
 * - mongosh "mongodb://localhost:27017/booknest" scripts/queries.js
 * - Or copy/paste into MongoDB Compass embedded >_ MONGOSH tab
 */

const targetDb = typeof db !== 'undefined' ? db.getSiblingDB('booknest') : null;
if (!targetDb) {
  print("Error: 'db' object is not available. Please run this script in mongosh.");
}

print("=========================================================================");
print("📖 REQUIREMENT 2: ADVANCED QUERIES & OPERATIONS IN MONGOSH");
print("=========================================================================");

// -----------------------------------------------------------------------------
// 1. COMPARISON OPERATORS ($gt, $lte, $in, $ne)
// -----------------------------------------------------------------------------
print("\n--- [1.1] Comparison Operator: $gt (Books with price > 35 USD) ---");
const gtBooks = targetDb.books.find(
  { price: { $gt: 35 } },
  { title: 1, price: 1, category: 1, _id: 0 }
).toArray();
printjson(gtBooks);

print("\n--- [1.2] Comparison Operator: $lte (Books with quantity <= 10 - Restock Needed) ---");
const lteBooks = targetDb.books.find(
  { quantity: { $lte: 10 } },
  { title: 1, quantity: 1, category: 1, _id: 0 }
).toArray();
printjson(lteBooks);

print("\n--- [1.3] Comparison Operator: $in (Books in 'Software Engineering' or 'Web Development') ---");
const inBooks = targetDb.books.find(
  { category: { $in: ["Software Engineering", "Web Development"] } },
  { title: 1, category: 1, price: 1, _id: 0 }
).limit(5).toArray();
printjson(inBooks);

print("\n--- [1.4] Comparison Operator: $ne (Books published in years OTHER than 2020) ---");
const neBooks = targetDb.books.find(
  { publishedYear: { $ne: 2020 } },
  { title: 1, publishedYear: 1, _id: 0 }
).limit(5).toArray();
printjson(neBooks);

// -----------------------------------------------------------------------------
// 2. REGEX SEARCH ($regex case-insensitive)
// -----------------------------------------------------------------------------
print("\n--- [2.0] Regex Search: Case-insensitive search for books containing 'clean' ---");
const regexBooks = targetDb.books.find(
  { title: { $regex: /clean/i } },
  { title: 1, authorId: 1, price: 1, _id: 0 }
).toArray();
printjson(regexBooks);

// -----------------------------------------------------------------------------
// 3. PAGINATION: PROJECTION, SORT, SKIP, LIMIT (Page 2, 3 books per page)
// -----------------------------------------------------------------------------
print("\n--- [3.0] Pagination: Page 2 with 3 books/page sorted descending by price ---");
// Page formula: skip = (page - 1) * limit = (2 - 1) * 3 = 3
const page = 2;
const pageSize = 3;
const skipCount = (page - 1) * pageSize;

const pagedBooks = targetDb.books.find(
  {}, // all books
  { title: 1, price: 1, category: 1, publishedYear: 1, _id: 0 } // projection
)
.sort({ price: -1 }) // sort descending by price
.skip(skipCount)    // skip page 1 items
.limit(pageSize)    // take 3 items
.toArray();

print(`Page ${page} Results (${pagedBooks.length} items, sorted by price DESC):`);
printjson(pagedBooks);

// -----------------------------------------------------------------------------
// 4. UPDATE & DELETE OPERATIONS
// -----------------------------------------------------------------------------
print("\n--- [4.1] updateOne with $set and $inc ---");
print("Target book: 'Clean Code: A Handbook of Agile Software Craftsmanship'");
const updateResult = targetDb.books.updateOne(
  { title: "Clean Code: A Handbook of Agile Software Craftsmanship" },
  {
    $set: { price: 39.99, lastRestockedAt: new Date() },
    $inc: { quantity: 5 }
  }
);
print(`Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

// Verify updated book
const updatedBook = targetDb.books.findOne(
  { title: "Clean Code: A Handbook of Agile Software Craftsmanship" },
  { title: 1, price: 1, quantity: 1, lastRestockedAt: 1, _id: 0 }
);
print("Updated document state:");
printjson(updatedBook);

print("\n--- [4.2] deleteMany with a filter ---");
print("Filter: Delete books with quantity <= 0 (out of stock/deprecated drafts)");
const deleteResult = targetDb.books.deleteMany({ quantity: { $lte: 0 } });
print(`Deleted documents count: ${deleteResult.deletedCount}`);

// -----------------------------------------------------------------------------
// 5. AGGREGATION PIPELINE: COUNT BOOKS PER CATEGORY (SORT DESCENDING)
// -----------------------------------------------------------------------------
print("\n--- [5.0] Aggregation Pipeline: Count books per category & sort descending ---");
const categoryAggregation = targetDb.books.aggregate([
  {
    $group: {
      _id: "$category",
      totalBooks: { $sum: 1 },
      averagePrice: { $avg: "$price" },
      totalQuantity: { $sum: "$quantity" }
    }
  },
  {
    $project: {
      _id: 1,
      totalBooks: 1,
      averagePrice: { $round: ["$averagePrice", 2] },
      totalQuantity: 1
    }
  },
  {
    $sort: { totalBooks: -1, _id: 1 }
  }
]).toArray();

print("Category Aggregation Result:");
printjson(categoryAggregation);

print("\n=========================================================================");
print("✓ REQUIREMENT 2 EXECUTION COMPLETE");
print("=========================================================================");
