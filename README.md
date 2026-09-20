# 📚 BookNest Online Bookstore — SDN302 Monorepo

> **Course**: SDN302 - Server-side Development with NodeJS, Express and MongoDB  
> **Institution**: FPT University  
> **Student**: Nguyen Le Quang Trung (DS190284)  
> **Branch**: `lab03`  

---

## 🌟 Case Study Overview: BookNest Online Bookstore

All labs across this course are structured around a single running case study: **BookNest Online Bookstore**. Each lab progressively extends and refines the architectural capabilities developed in the previous lab, tracking the transition from native Node.js core modules to production-grade Express.js RESTful web services.

```text
d:\Semester7\SDN302\
├── CONTEXT.md                            # Centralized BookNest domain model & vocabulary
├── docs/
│   └── adr/
│       └── 0001-lab03-architecture-and-api-design.md # Architecture Decision Records
├── lab01-nodejs/                         # Lab 01: Node.js Core, CLI & Module Utilities
│   ├── app.js                            # CommonJS entry point
│   ├── app-esm.mjs                       # ES Modules entry point
│   ├── bookUtils.js                      # Book utility functions (CommonJS)
│   ├── bookUtils-esm.mjs                  # Book utility functions (ESM)
│   └── package.json
├── lab02-nodejs/                         # Lab 02: HTTP Module & Filesystem Persistence
│   ├── server.ts                         # Native Node.js HTTP REST server (TypeScript)
│   ├── fileHelpers.ts                    # Asynchronous file I/O & logging
│   ├── books.json                        # Persistent JSON database (7 books)
│   ├── public/                           # Static assets & catalog download stream
│   ├── verifyServer.ts                   # Automated verification suite
│   ├── BookNest_Lab02.postman_collection.json # Postman collection
│   └── LAB02_REPORT.md                   # Full Lab 02 technical report
└── lab03-nodejs/                         # Lab 03: Building Web Applications with Express.js
    ├── lab03-express/                    # Primary hand-crafted Express application
    │   ├── data/books.js                 # In-memory bookstore dataset (7 books) & CRUD
    │   ├── middlewares/                  # Auth (x-api-key), latency logger, error handlers
    │   ├── routes/bookRouter.js          # RESTful book routing & validation
    │   ├── public/                       # Landing page (index.html, style.css)
    │   ├── index.js                      # Express application entry point
    │   └── package.json
    ├── lab03-generated/                  # Express Generator skeleton (Requirement 5)
    ├── BookNest_Lab03.postman_collection.json # Complete Postman test collection
    ├── verifyLab03.js                    # Automated end-to-end verification suite (27 tests)
    └── LAB03_REPORT.md                   # Full Lab 03 report & generator analysis
```

---

## 🔄 Architectural Evolution Across Labs

| Dimension | Lab 01: Node.js & Modules | Lab 02: HTTP & File System | Lab 03: Express.js Web Apps |
| :--- | :--- | :--- | :--- |
| **Primary Focus** | Node.js Runtime, CLI arguments, OS/Path, Module Systems | Core HTTP server, async file I/O, streams, callbacks | Framework web app, modular routers, middleware pipeline |
| **BookNest Role** | Calculation utilities (`formatPrice`, `applyDiscount`, `isValidISBN`) | Persistent storage (`books.json`), catalog downloads, manual HTTP routing | Complete RESTful API service (`/api/books`), authentication, centralized error handling |
| **Runtime / Lang** | JavaScript (CommonJS & ESM) | TypeScript with `tsx` | JavaScript (ES Modules `"type": "module"`) |
| **Data Storage** | Transient variables | File-based JSON database (`books.json`) | In-memory reactive array with auto ID generation |
| **Security / Auth** | N/A | N/A | Application-level `x-api-key` header middleware (401) |
| **Logging** | Console logs | File append log (`access.log`) | `morgan('dev')` + Custom high-precision latency logger |
| **Testing** | Console assertions | `verifyServer.ts` + Postman | `verifyLab03.js` (27/27 PASS) + Postman Collection |

---

## 🚀 Quick Start Guide

### 1. Lab 01 — Node.js Core & Book Utilities

```bash
cd lab01-nodejs

# Run CommonJS version
npm start
# or: node app.js 15 25

# Run ES Modules version
npm run start:esm
```

### 2. Lab 02 — HTTP Module & File System (TypeScript)

```bash
cd lab02-nodejs
npm install

# Start server in watch mode (Port 3000)
npm run dev

# Run automated server verification suite
npm run test:server
```

### 3. Lab 03 — Express.js Web Application

```bash
cd lab03-nodejs/lab03-express
npm install

# Start development mode with auto-reload (nodemon)
npm run dev

# Run automated verification suite (from lab03-nodejs)
cd ..
node verifyLab03.js
```

- **Interactive Landing Page**: Open `http://localhost:3000/`
- **Health Check Endpoint**: `http://localhost:3000/health`
- **Generator Project (Req 5)**: Located in `lab03-nodejs/lab03-generated/`

---

## 📮 Postman Collections

Both Lab 02 and Lab 03 include complete, pre-configured Postman Collections with automated test scripts:
- **Lab 02**: [`lab02-nodejs/BookNest_Lab02.postman_collection.json`](file:///d:/Semester7/SDN302/lab02-nodejs/BookNest_Lab02.postman_collection.json)
- **Lab 03**: [`lab03-nodejs/BookNest_Lab03.postman_collection.json`](file:///d:/Semester7/SDN302/lab03-nodejs/BookNest_Lab03.postman_collection.json)
  - Pre-configured variables: `baseUrl = http://localhost:3000`, `apiKey = booknest-secret-key-2026`
  - Covers all success (200, 201) and error conditions (400, 401, 404, 500).

---

## 📖 Domain Glossary & Architecture Decisions
- **Domain Model**: See [`CONTEXT.md`](file:///d:/Semester7/SDN302/CONTEXT.md) for canonical BookNest domain terms and rules.
- **Architecture Decisions**: See [`docs/adr/0001-lab03-architecture-and-api-design.md`](file:///d:/Semester7/SDN302/docs/adr/0001-lab03-architecture-and-api-design.md).
