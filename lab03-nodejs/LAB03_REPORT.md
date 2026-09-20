# LAB 03 REPORT: BUILDING WEB APPLICATIONS WITH EXPRESS.JS

- **Course**: SDN302 - Server-side Development with NodeJS, Express and MongoDB
- **Lab**: Lab 03 - Building Web Applications with Express.js
- **Case Study**: BookNest Online Bookstore
- **Student**: Nguyen Le Quang Trung (DS190284)
- **Date**: 2026-09-20

---

## 1. Overview & Project Layout

Lab 03 comprises two distinct Express applications within `lab03-nodejs/`:
1. **`lab03-express/`**: The primary, hand-crafted RESTful API application implementing Requirements 1 through 4 (ES Modules, custom middleware pipeline, in-memory Book store, validation, and centralized error handling).
2. **`lab03-generated/`**: The skeleton application generated using `npx express-generator --no-view lab03-generated` fulfilling Requirement 5.

```text
lab03-nodejs/
├── lab03-express/                  # Primary manual Express application
│   ├── data/
│   │   └── books.js                # In-memory bookstore dataset & CRUD helpers
│   ├── middlewares/
│   │   ├── auth.js                 # Application-level x-api-key validator (Req 3)
│   │   ├── errorHandler.js         # 404 and central error handler (Req 4)
│   │   └── logger.js               # Custom response-time logger (Req 3)
│   ├── public/                     # Static files directory (Req 3)
│   │   ├── index.html              # BookNest API documentation & interactive tester
│   │   └── style.css               # Modern dark-mode styling
│   ├── routes/
│   │   └── bookRouter.js           # RESTful book routes (/api/books) (Req 2 & 4)
│   ├── .env                        # Environment configuration (PORT=3000, API_KEY)
│   ├── .env.example                # Example environment file
│   ├── index.js                    # Server entry point & middleware mounting (Req 1)
│   └── package.json                # Dependencies: express, dotenv, morgan, nodemon
├── lab03-generated/                # Skeleton generated via express-generator (Req 5)
│   ├── bin/
│   │   └── www                     # HTTP server startup and port listening script
│   ├── public/                     # Static assets (images, javascripts, stylesheets)
│   ├── routes/                     # Routers (index.js, users.js)
│   ├── app.js                      # Express configuration & middleware setup
│   └── package.json
├── BookNest_Lab03.postman_collection.json # Complete Postman test collection
├── verifyLab03.js                  # Automated test script testing all requirements
└── LAB03_REPORT.md                 # Detailed report and Requirement 5 explanation
```

---

## 2. Requirement 5: Express Generator Analysis

### 2.1 Role of Each Generated File and Folder

| File / Folder | Role & Description |
| :--- | :--- |
| **`bin/www`** | The executable entry script for bootstrapping the Node.js HTTP server. It requires `../app`, parses and normalizes the target port from `process.env.PORT` (defaulting to 3000), instantiates a standard Node `http.Server(app)`, attaches event listeners for `'error'` (`onError`) and `'listening'` (`onListening`), and begins listening on the network interface. |
| **`app.js`** | The core Express application module. It initializes the `express()` instance, configures foundational middleware (`logger('dev')`, `express.json()`, `express.urlencoded()`, `cookieParser()`, `express.static()`), mounts modular routers (`/` and `/users`), and exports the `app` instance using `module.exports = app;` without directly calling `app.listen()`. |
| **`routes/`** | The modular routing folder organizing endpoint handlers by resource or feature domain using `express.Router()`. The generated project includes `routes/index.js` (rendering the homepage) and `routes/users.js` (a placeholder user resource). |
| **`public/`** | The static file serving root served by `express.static()`. It contains subdirectories for client-side assets: `public/images/`, `public/javascripts/`, and `public/stylesheets/style.css` alongside a static `index.html`. Any client requesting assets at `/stylesheets/style.css` or `/images/...` is served directly without passing through application routing logic. |

### 2.2 Key Differences Between Generated Structure and Manual Structure

#### Difference 1: Separation of Server Bootstrap (`bin/www`) vs Application Configuration (`app.js`)
- **In `lab03-generated`**: The architecture separates the Node HTTP network server lifecycle from the Express application configuration. `app.js` is purely an Express request handler exported via `module.exports`, while `bin/www` is responsible for binding the port, listening to socket events, and handling OS signals (`EADDRINUSE`, `EACCES`). This allows `app.js` to be imported easily into integration tests (e.g., Supertest) without binding a live TCP port.
- **In `lab03-express` (manual)**: The server creation and routing configuration are unified within `index.js`. While cleaner and faster for initial development and smaller services, it couples port listening with router declaration.

#### Difference 2: Module System (CommonJS vs ECMAScript Modules)
- **In `lab03-generated`**: Employs legacy Node.js **CommonJS** syntax (`var express = require('express')`, `module.exports = app;`).
- **In `lab03-express` (manual)**: Configured with `"type": "module"` in `package.json` utilizing native modern **ES Modules** (`import express from 'express'`, `export default app;`). This provides tree-shaking support, static analysis, and aligns with modern JavaScript standards.

#### Difference 3: Middleware Pipeline, Validation & Security
- **In `lab03-generated`**: Supplies only basic defaults (`cookie-parser`, standard static files) with no authentication middleware, no input validation, and no customized centralized error-handling response format.
- **In `lab03-express` (manual)**: Implements an end-to-end layered pipeline:
  1. `morgan('dev')` + `customLogger` (calculating precise response time in milliseconds).
  2. Application-level route protection (`apiKeyAuth`) gating `/api/books` behind `x-api-key`.
  3. Centralized validation logic ensuring `title` exists, `price > 0`, and `category` belongs to `['IT', 'Business', 'Literature', 'Fiction', 'Science']`.
  4. Uniform JSON error envelope via custom 404 handler and 4-parameter `(err, req, res, next)` error handler.

---

## 3. API Endpoints Reference & Status Codes

All `/api/books` routes require the `x-api-key: booknest-secret-key-2026` header.

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root welcome message and API index | `200 OK` |
| `GET` | `/health` | Server uptime and health check | `200 OK` |
| `GET` | `/api/books` | Retrieve list of all books | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/books/:id` | Retrieve single book by ID | `200 OK`, `401 Unauthorized`, `404 Not Found` |
| `POST` | `/api/books` | Create new book | `201 Created`, `400 Bad Request`, `401 Unauthorized` |
| `PUT` | `/api/books/:id` | Update existing book by ID | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| `DELETE` | `/api/books/:id` | Delete book by ID | `200 OK`, `401 Unauthorized`, `404 Not Found` |
| `GET` | `/api/books/error-test` | Deliberately trigger central error handler | `500 Internal Server Error`, `401 Unauthorized` |
| `ALL` | `/*` (unknown route) | Catch-all for unhandled routes | `404 Not Found` |

---

## 4. How to Run and Test

### 4.1 Running `lab03-express` (Manual App)

```bash
cd d:\Semester7\SDN302\lab03-nodejs\lab03-express

# Install dependencies (if not already installed)
npm install

# Start development mode with auto-reload (nodemon)
npm run dev

# Or start in standard production mode
npm start
```

- Web UI & Landing Page: `http://localhost:3000/`
- Health check: `http://localhost:3000/health`

### 4.2 Running `lab03-generated` (Generator App)

```bash
cd d:\Semester7\SDN302\lab03-nodejs\lab03-generated

# Start generated app on default port 3000 (or custom PORT)
npm start
```

### 4.3 Running Automated Tests

A dedicated verification suite is provided in `lab03-nodejs/verifyLab03.js`:

```bash
cd d:\Semester7\SDN302\lab03-nodejs
node verifyLab03.js
```
This tests all 16 distinct scenarios across Requirements 1, 2, 3, and 4 and outputs colored test assertions.

### 4.4 Testing with Postman

1. Open Postman.
2. Click **Import** and select `d:\Semester7\SDN302\lab03-nodejs\BookNest_Lab03.postman_collection.json`.
3. The collection is pre-configured with `baseUrl: http://localhost:3000` and `apiKey: booknest-secret-key-2026`.
4. Run individual requests or use **Collection Runner** to execute all tests sequentially.
