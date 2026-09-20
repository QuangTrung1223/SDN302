# BookNest Online Bookstore

Online bookstore platform for browsing, managing, and purchasing books across various categories.

## Language

**Book**:
A published work in the BookNest catalog, identified by an ISBN or unique ID, containing title, author, category, and price details.
_Avoid_: Item, product, article

**Category**:
The primary classification grouping for books (e.g., IT, Science, Fiction) used to filter the catalog.
_Avoid_: Tag, genre, department

**Catalog**:
The collection of all books managed by BookNest, persisted in storage and queryable by clients.
_Avoid_: Inventory, database, list

**Access Log**:
A chronological record of incoming HTTP requests logging the timestamp, HTTP method, and requested URL.
_Avoid_: Audit trail, history, trace
