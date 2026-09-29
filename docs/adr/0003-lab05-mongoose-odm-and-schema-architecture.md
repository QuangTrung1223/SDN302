# Mongoose ODM Schema Architecture and MVC Design for Lab 05

## Context
Lab 05 advances the BookNest Online Bookstore from raw MongoDB native driver queries to **Mongoose ODM (Object-Document Mapper)**. Requirements mandate transitioning to an MVC architectural pattern, enforcing strict document validation, implementing schema middleware hooks (`pre('save')`, `post('save')`), defining custom instance and static methods, managing virtual properties, and implementing centralized error handling for ODM-specific errors (`ValidationError`, `CastError`, duplicate key `11000`).

## Decisions

1. **MVC Pattern Organization**:
   - *Decision*: Segment application concerns into dedicated directories:
     - `config/`: Database connection management and environment configurations.
     - `models/`: Mongoose Schemas, models, validation rules, hooks, and virtuals.
     - `controllers/`: HTTP request handlers and business logic coordinating models and responses.
     - `routes/`: Express modular routers mapping URLs to controller actions.
     - `middlewares/`: Centralized error handling and request monitoring.
   - *Rationale*: Enforces clean separation of concerns, simplifies unit/integration testing, and prevents route files from becoming bloated with raw database queries.

2. **Schema Modeling with Strict Typing & Multi-Level Validators**:
   - *Decision*: Model `Book` with 5 distinct types (`String`, `Number`, `Date`, `Boolean`, `Array`) and 7 built-in validators (`required`, `default`, `enum`, `min`, `max`, `minlength`, `unique`).
   - *Rationale*: Enforces database hygiene at the application level before queries reach the database engine, reducing bad writes and ensuring consistent data contracts.

3. **Custom Validators & Regex Validation**:
   - *Decision*: Add custom validators for:
     - `isbn`: Validated via Regex pattern ensuring genuine 10/13-digit ISBN structure.
     - `publishedYear`: Validated dynamically to disallow future publication dates (`publishedYear <= currentYear`).
   - *Rationale*: Native built-in validators only cover basic ranges; custom validators encode domain business logic directly into the schema.

4. **Lifecycle Hooks (Mongoose Middleware)**:
   - *Decision*: 
     - `pre('save')`: Automatically normalizes (trims) text and derives an SEO-friendly `slug` from `title` using regex-based slugification.
     - `post('save')`: Logs the saved document `_id` for traceability and auditability.
   - *Rationale*: Centralizes document formatting and audit logging at the model layer so individual controller methods do not repeat slugification logic.

5. **`findByIdAndUpdate` Options Policy (`{ new: true, runValidators: true }`)**:
   - *Decision*: Mandate `{ new: true, runValidators: true }` for all document update operations.
   - *Rationale*: By default, Mongoose returns the *unmodified* document (`new: false`) and bypasses schema validators on update operations (`runValidators: false`). Enforcing both ensures controllers receive the latest persisted state and prevent updates from inserting invalid data (e.g. negative prices).

6. **Centralized Error Normalization**:
   - *Decision*: Translate Mongoose-specific errors in `errorHandler.js`:
     - `ValidationError` -> HTTP 400 with a detailed field-by-field error map.
     - `CastError` -> HTTP 400 with a friendly "Invalid identifier format" message.
     - Code `11000` (Duplicate Key) -> HTTP 409 Conflict with the conflicting field name.
   - *Rationale*: Prevents internal database stack traces from leaking to clients while providing actionable error messages for frontend forms.
