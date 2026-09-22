/**
 * BookNest Online Bookstore - Requirement 3 Relationships Demo
 * Course: SDN302 - Server-side Development with NodeJS, Express and MongoDB
 * Lab: Lab 04 - NoSQL Databases with MongoDB
 * Student: Nguyen Le Quang Trung (DS190284)
 *
 * Usage:
 * - mongosh "mongodb://localhost:27017/booknest" scripts/relationships.js
 * - Or copy/paste into MongoDB Compass embedded >_ MONGOSH tab
 */

const targetDb = typeof db !== 'undefined' ? db.getSiblingDB('booknest') : null;
if (!targetDb) {
  print("Error: 'db' object is not available. Please run this script in mongosh.");
}

print("=========================================================================");
print("🔗 REQUIREMENT 3: RELATIONSHIPS MODELING (EMBEDDED & REFERENCED)");
print("=========================================================================");

// -----------------------------------------------------------------------------
// 1. EMBEDDED RELATIONSHIP: Reviews embedded in Book documents
// -----------------------------------------------------------------------------
print("\n--- [3.1] Embedded Relationship: Book Reviews ---");
print("Querying books with their embedded reviews array...");

const sampleEmbedded = targetDb.books.findOne(
  { "reviews.0": { $exists: true } },
  { title: 1, price: 1, reviews: 1, _id: 0 }
);
print("Sample book with embedded reviews:");
printjson(sampleEmbedded);

print("\n--- Querying with $elemMatch on embedded reviews (Find books with 5-star reviews) ---");
const fiveStarBooks = targetDb.books.find(
  { reviews: { $elemMatch: { rating: 5 } } },
  { title: 1, "reviews.$": 1, _id: 0 }
).limit(2).toArray();
printjson(fiveStarBooks);

// -----------------------------------------------------------------------------
// 2. REFERENCED RELATIONSHIP: Book referencing Author via authorId (ObjectId)
// -----------------------------------------------------------------------------
print("\n--- [3.2] Referenced Relationship: Book -> Author via ObjectId and $lookup ---");
print("Performing $lookup aggregation to join 'books' collection with 'authors' collection...");

const joinedBooks = targetDb.books.aggregate([
  {
    $lookup: {
      from: "authors",
      localField: "authorId",
      foreignField: "_id",
      as: "authorDetails"
    }
  },
  {
    $unwind: {
      path: "$authorDetails",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      _id: 0,
      title: 1,
      price: 1,
      category: 1,
      authorName: "$authorDetails.name",
      authorNationality: "$authorDetails.nationality",
      authorBio: "$authorDetails.bio"
    }
  },
  { $limit: 3 }
]).toArray();

print("Result of $lookup Join (Books + Author Details):");
printjson(joinedBooks);

// -----------------------------------------------------------------------------
// 3. COMPLETE 3-WAY JOIN: Book -> Author AND Book -> Category via $lookup
// -----------------------------------------------------------------------------
print("\n--- [3.3] Advanced Multi-collection Join ($lookup for both Author and Category) ---");
const fullJoined = targetDb.books.aggregate([
  {
    $lookup: {
      from: "authors",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" },
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "categoryDoc"
    }
  },
  { $unwind: "$categoryDoc" },
  {
    $project: {
      _id: 0,
      title: 1,
      price: 1,
      author: "$author.name",
      category: "$categoryDoc.name",
      categoryDescription: "$categoryDoc.description",
      reviewCount: { $size: "$reviews" }
    }
  },
  { $limit: 2 }
]).toArray();

print("Result of Multi-Collection Join:");
printjson(fullJoined);

print("\n=========================================================================");
print("✓ REQUIREMENT 3 EXECUTION COMPLETE");
print("=========================================================================");
