# BookNest Online Bookstore

BookNest is an online bookstore application developed across SDN302 course labs, providing RESTful catalog management, inventory tracking, and client-facing endpoints.

## Evolution Across Labs
- **Lab 01**: Foundational Node.js runtime, CLI arithmetic, system metrics, and BookNest utility functions (`formatPrice`, `applyDiscount`, `isValidISBN`) in CommonJS and ES Modules.
- **Lab 02**: Native Node.js HTTP server, asynchronous filesystem persistence (`books.json`), catalog downloads via streams, access logging, and RESTful CRUD endpoints.
- **Lab 03**: Production-ready Express.js web application, modular `express.Router()`, multi-tier middleware pipeline (`morgan`, custom latency logger, `x-api-key` auth), centralized error handling, and comparison against `express-generator`.
- **Lab 04**: NoSQL database persistence with MongoDB, collections (`books`, `authors`, `categories`), advanced `mongosh` queries (comparison operators, `$regex`, pagination, update/delete), aggregation pipelines, and hybrid data modeling (embedded `reviews` vs referenced `authorId`).
- **Lab 05**: Object-Document Mapping (ODM) with Mongoose, MVC project structure, Schema design with strict typing and multi-level validators, pre/post middleware hooks, instance & static methods, virtual properties, and centralized Mongoose error handling.

## Language

**Book**:
A published written work in the catalog, identified by a unique `_id` with title, price, quantity, publishedYear, category, and tags.
_Avoid_: Item, product, publication

**Author**:
The creator of a published work, stored in the dedicated `authors` collection with bio, nationality, and birthYear, referenced by books via `authorId` (`ObjectId`).
_Avoid_: Writer, contributor, creator

**Category**:
A predefined classification assigned to a book to organize the catalog (e.g. IT, Business, Literature, Fiction, Science), managed as a dedicated collection and referenced/denormalized on book documents.
_Avoid_: Genre, tag, topic

**Review**:
Customer evaluation subdocument containing reviewer name, rating (1-5), comment, and date, embedded directly within the book document to preserve data locality.
_Avoid_: Feedback, comment, testimonial

**Tag**:
A keyword or descriptor stored in an array within a book document facilitating multi-criteria categorisation and filtering.
_Avoid_: Label, hashtag, mark

**Quantity**:
The numeric count of physical or digital book units available for purchase in the MongoDB catalog document.
_Avoid_: Volume, amount, balance

**Catalog**:
The complete collection of books available in the BookNest bookstore.
_Avoid_: Inventory list, warehouse, store items

**ISBN**:
A 13-digit International Standard Book Number uniquely identifying a book edition.
_Avoid_: Code, barcode, serial number

**Discount**:
A percentage deduction applied to a book's base price to produce a discounted retail price.
_Avoid_: Coupon, rebate, sale deduction

**Stock**:
The current quantity of physical or digital book units available for purchase in previous lab architectures.
_Avoid_: Inventory count, quantity, volume

**API Key**:
A client authentication credential supplied in the `x-api-key` header required to access protected bookstore endpoints.
_Avoid_: Token, bearer token, secret, access code

**Health Status**:
System diagnostic data indicating whether the application server is operational alongside its current uptime.
_Avoid_: Ping, heartbeat, server state

**ODM (Object-Document Mapper)**:
An abstraction layer (Mongoose) mapping JavaScript domain models to MongoDB collections, providing schema validation, middleware hooks, and business logic methods.
_Avoid_: ORM, SQL driver, query builder

**Slug**:
A human-readable, URL-friendly unique identifier automatically derived from a book or category title.
_Avoid_: Permalink, URL path, alias

**Virtual Property**:
A computed document property defined on a Mongoose schema that is derived dynamically at runtime and not stored physically in MongoDB.
_Avoid_: Computed column, derived field, shadow property
