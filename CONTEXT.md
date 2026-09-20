# BookNest Online Bookstore

BookNest is an online bookstore application developed across SDN302 course labs, providing RESTful catalog management, inventory tracking, and client-facing endpoints.

## Evolution Across Labs
- **Lab 01**: Foundational Node.js runtime, CLI arithmetic, system metrics, and BookNest utility functions (`formatPrice`, `applyDiscount`, `isValidISBN`) in CommonJS and ES Modules.
- **Lab 02**: Native Node.js HTTP server, asynchronous filesystem persistence (`books.json`), catalog downloads via streams, access logging, and RESTful CRUD endpoints.
- **Lab 03**: Production-ready Express.js web application, modular `express.Router()`, multi-tier middleware pipeline (`morgan`, custom latency logger, `x-api-key` auth), centralized error handling, and comparison against `express-generator`.

## Language

**Book**:
A published written work in the catalog, identified by a unique ID with title, author, price, category, and stock count.
_Avoid_: Item, product, publication

**ISBN**:
A 13-digit International Standard Book Number uniquely identifying a book edition.
_Avoid_: Code, barcode, serial number

**Category**:
A predefined classification assigned to a book to organize the catalog (e.g. IT, Business, Literature, Fiction, Science).
_Avoid_: Genre, tag, topic

**Catalog**:
The complete collection of books available in the BookNest bookstore.
_Avoid_: Inventory list, warehouse, store items

**Discount**:
A percentage deduction applied to a book's base price to produce a discounted retail price.
_Avoid_: Coupon, rebate, sale deduction

**Stock**:
The current quantity of physical or digital book units available for purchase.
_Avoid_: Inventory count, quantity, volume

**API Key**:
A client authentication credential supplied in the `x-api-key` header required to access protected bookstore endpoints.
_Avoid_: Token, bearer token, secret, access code

**Health Status**:
System diagnostic data indicating whether the application server is operational alongside its current uptime.
_Avoid_: Ping, heartbeat, server state
