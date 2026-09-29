# NoSQL Data Modeling and Hybrid Schema Design for Lab 04 (MongoDB)

## Context
Lab 04 requires transitioning the BookNest Online Bookstore from in-memory/file-based storage to a NoSQL document database (MongoDB). The assignment demands modeling three entities (`books`, `authors`, `categories`), implementing both embedded relationships (e.g., book reviews) and referenced relationships (book to author via `ObjectId`), while supporting efficient queries, pagination, and category aggregation.

## Decisions

1. **Embedded Reviews (`books.reviews`)**:
   - *Decision*: Embed an array of review subdocuments (`reviewer`, `rating`, `comment`, `createdAt`) directly inside each book document.
   - *Rationale*: Reviews possess 1-to-few cardinality, have a lifecycle strictly bound to the parent book, and are predominantly retrieved alongside the book details. Embedding eliminates multi-document joins (`$lookup`) and takes full advantage of MongoDB's document atomicity and read locality.

2. **Referenced Authors (`books.authorId` -> `authors._id`)**:
   - *Decision*: Store authors in a separate `authors` collection and link books via `authorId: ObjectId(...)`.
   - *Rationale*: Authors exist independently of any individual book, can author multiple books (1-to-N or N-to-N), and have biographies/metadata that would cause massive data duplication and update anomalies if embedded across hundreds of books.

3. **Hybrid Category Modeling (Denormalization + Reference)**:
   - *Decision*: Maintain a dedicated `categories` collection (`_id`, `name`, `description`), while storing both `category: "IT & Software"` (string) and `categoryId: ObjectId(...)` on book documents.
   - *Rationale*: Requirement 2 specifically requires aggregating and grouping books per category (`$group: { _id: "$category", count: { $sum: 1 } }`). Storing the category name directly avoids an expensive `$lookup` stage for standard catalog listings and aggregations, while `categoryId` retains referential integrity with the master categories collection.

4. **Multi-Platform Verification Strategy**:
   - *Decision*: Provide dual execution paths: standalone JavaScript files (`scripts/seed.js`, `scripts/queries.js`, `scripts/relationships.js`) for direct execution inside MongoDB Compass's `>_ _MONGOSH` console, alongside an automated Node.js test harness (`verifyLab04.js`) utilizing the official `mongodb` driver.
   - *Rationale*: Allows seamless grading and verification whether evaluating through GUI/Compass or automated CLI workflows.
