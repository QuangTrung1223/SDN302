# Architecture and API Design for Lab 03 (Express.js)

## Context
Lab 03 requires building a RESTful BookNest bookstore application in Express.js alongside an exploration of `express-generator`. Decisions were needed on module system, directory structure, middleware pipeline, and data response formats.

## Decisions
1. **Directory Structure**: Separate manual Express application (`lab03-express/`) and scaffolded application (`lab03-generated/`) into dedicated subdirectories within `lab03-nodejs/`, with documentation in `LAB03_REPORT.md`.
2. **Module System**: Use Node.js ES Modules (`"type": "module"`) with `import`/`export` and `nodemon` for clean, modern JavaScript syntax.
3. **Authentication Middleware**: Implement an application-level middleware for `/api/books` verifying `x-api-key` against configured environment variable `API_KEY` (fallback `booknest-secret-key-2026`), returning 401 when missing or invalid.
4. **Response Envelope**: Standardize all API responses with `{ success: true, data, message }` on success and `{ success: false, error, message }` on errors.
5. **Centralized Error Handling**: Implement dedicated 404 route middleware and standard 4-argument `(err, req, res, next)` error handler. Provide `GET /api/books/error-test` for deterministic error verification.
