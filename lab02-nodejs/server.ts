import http from "node:http";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readBooksAsync,
  writeBooksAsync,
  logAccess,
  initLogsDir
} from "./fileHelpers.js";
import type { Book, NewBookInput } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");
const DOWNLOAD_FILE = path.join(PUBLIC_DIR, "downloads", "booknest-catalog.txt");
const PORT: number = Number(process.env.PORT) || 3000;

// MIME Types Dictionary
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf"
};

/**
 * Helper to get MIME type by file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Handle Static File Serving from public/
 */
async function tryServeStaticFile(pathname: string, res: http.ServerResponse): Promise<boolean> {
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, relativePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return false;
  }

  try {
    const stats = await fsPromises.stat(filePath);
    if (stats.isFile()) {
      const mimeType = getMimeType(filePath);
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Content-Length": stats.size
      });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      return true;
    }
  } catch {
    // File not found or inaccessible
  }

  return false;
}

/**
 * Create Core HTTP Web Server
 */
export const server: http.Server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const reqUrl = req.url || "/";
  const reqMethod = req.method || "GET";

  // Requirement 4: Append to logs/access.log for every request
  await logAccess(reqMethod, reqUrl);

  const parsedUrl = new URL(reqUrl, `http://${req.headers.host || "localhost:3000"}`);
  const pathname = parsedUrl.pathname;

  // ============================================================
  // Route 1: GET / (Homepage)
  // ============================================================
  if (pathname === "/") {
    if (reqMethod !== "GET") {
      res.writeHead(405, {
        "Content-Type": "application/json; charset=utf-8",
        "Allow": "GET"
      });
      return res.end(JSON.stringify({
        error: `Method ${reqMethod} Not Allowed on /`,
        allowedMethods: ["GET"]
      }, null, 2));
    }

    const indexPath = path.join(PUBLIC_DIR, "index.html");
    try {
      const content = await fsPromises.readFile(indexPath, "utf-8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(content);
    } catch {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("500 Internal Server Error: Unable to read index.html");
    }
  }

  // ============================================================
  // Route 2: GET /about
  // ============================================================
  if (pathname === "/about") {
    if (reqMethod !== "GET") {
      res.writeHead(405, {
        "Content-Type": "application/json; charset=utf-8",
        "Allow": "GET"
      });
      return res.end(JSON.stringify({
        error: `Method ${reqMethod} Not Allowed on /about`,
        allowedMethods: ["GET"]
      }, null, 2));
    }

    const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>About BookNest</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container header-content">
      <div class="logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">Book<strong>Nest</strong></span>
      </div>
      <nav class="nav-links">
        <a href="/" class="nav-link">Home</a>
        <a href="/about" class="nav-link active">About Us</a>
        <a href="/api/books" class="nav-link" target="_blank">All Books</a>
        <a href="/download" class="btn btn-download">📥 Download Catalog</a>
      </nav>
    </div>
  </header>
  <main class="container" style="padding: 48px 24px;">
    <section class="endpoints-card">
      <h2>About BookNest Bookstore</h2>
      <p style="margin-bottom: 16px;">BookNest is an educational case study project built for the <strong>SDN302</strong> course at FPT University.</p>
      <p style="margin-bottom: 16px;">This server is built with pure Node.js core modules and TypeScript, adhering strictly to RESTful API principles, non-blocking I/O, and asynchronous file system operations.</p>
      <div style="margin-top: 24px;">
        <p><strong>Student:</strong> Nguyen Le Quang Trung (DS190284)</p>
        <p><strong>Architecture:</strong> Node.js HTTP Module &bull; Native FS Promises &bull; TypeScript &bull; ES Modules</p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-content">
      <p>&copy; 2026 BookNest Bookstore &bull; SDN302 Lab 02</p>
    </div>
  </footer>
</body>
</html>`;

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(aboutHtml);
  }

  // ============================================================
  // Route 3: /api/books (GET with Query Strings & POST Body Parsing)
  // ============================================================
  if (pathname === "/api/books") {
    // Handling GET /api/books (with optional ?category=IT&limit=2)
    if (reqMethod === "GET") {
      try {
        let books: Book[] = await readBooksAsync();
        const categoryQuery = parsedUrl.searchParams.get("category");
        const limitQuery = parsedUrl.searchParams.get("limit");

        // Filter by category if provided
        if (categoryQuery) {
          books = books.filter(
            (b) => b.category && b.category.toLowerCase() === categoryQuery.toLowerCase()
          );
        }

        // Limit results if provided
        if (limitQuery) {
          const limitNum = parseInt(limitQuery, 10);
          if (!isNaN(limitNum) && limitNum > 0) {
            books = books.slice(0, limitNum);
          }
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify(books, null, 2));
      } catch {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ error: "Failed to read books from storage" }));
      }
    }

    // Handling POST /api/books
    if (reqMethod === "POST") {
      const bodyChunks: Buffer[] = [];

      req.on("data", (chunk: Buffer) => {
        bodyChunks.push(chunk);
      });

      req.on("end", async () => {
        try {
          const rawBody = Buffer.concat(bodyChunks).toString("utf-8");
          const newBookData: NewBookInput = JSON.parse(rawBody);

          // Basic validation
          if (!newBookData.title || !newBookData.author || !newBookData.category) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            return res.end(JSON.stringify({
              error: "Invalid book data. 'title', 'author', and 'category' are required."
            }, null, 2));
          }

          // Read existing books and calculate next ID
          const existingBooks = await readBooksAsync();
          const maxId = existingBooks.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0);
          const newBook: Book = {
            id: maxId + 1,
            isbn: newBookData.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            title: newBookData.title,
            author: newBookData.author,
            category: newBookData.category,
            price: Number(newBookData.price) || 0,
            stock: Number(newBookData.stock) || 0
          };

          existingBooks.push(newBook);

          // Requirement 4: Persist into books.json
          await writeBooksAsync(existingBooks);

          // Return 201 Created with created object
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify(newBook, null, 2));
        } catch (parseError) {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify({
            error: "Malformed JSON in request body",
            details: (parseError as Error).message
          }, null, 2));
        }
      });

      return;
    }

    // Requirement 3: Return status 405 for unsupported methods (PUT, DELETE, etc.)
    res.writeHead(405, {
      "Content-Type": "application/json; charset=utf-8",
      "Allow": "GET, POST"
    });
    return res.end(JSON.stringify({
      error: `Method ${reqMethod} Not Allowed on /api/books`,
      allowedMethods: ["GET", "POST"]
    }, null, 2));
  }

  // ============================================================
  // Route 4: GET /download (Send file as attachment)
  // ============================================================
  if (pathname === "/download") {
    if (reqMethod !== "GET") {
      res.writeHead(405, {
        "Content-Type": "application/json; charset=utf-8",
        "Allow": "GET"
      });
      return res.end(JSON.stringify({
        error: `Method ${reqMethod} Not Allowed on /download`,
        allowedMethods: ["GET"]
      }, null, 2));
    }

    try {
      const stats = await fsPromises.stat(DOWNLOAD_FILE);
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": stats.size,
        "Content-Disposition": 'attachment; filename="booknest-catalog.txt"'
      });
      const stream = fs.createReadStream(DOWNLOAD_FILE);
      return stream.pipe(res);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Download file not found.");
    }
  }

  // ============================================================
  // Route 5: Static File Serving (/style.css, /booknest-banner.svg, etc.)
  // ============================================================
  const handled = await tryServeStaticFile(pathname, res);
  if (handled) {
    return;
  }

  // ============================================================
  // Route 6: 404 Page for any unknown route
  // ============================================================
  const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>404 - Page Not Found</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body style="text-align: center; padding: 100px 24px;">
  <h1 style="font-size: 4rem; color: #ef4444; margin-bottom: 16px;">404</h1>
  <h2 style="margin-bottom: 16px;">Page Not Found</h2>
  <p style="color: #94a3b8; margin-bottom: 24px;">The requested URL <code>${pathname}</code> does not exist on BookNest server.</p>
  <a href="/" class="btn btn-primary">Return to Homepage</a>
</body>
</html>`;

  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(notFoundHtml);
});

// Initialize logs directory at startup and start server
initLogsDir().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 BookNest Server (TypeScript) running at http://localhost:${PORT}`);
    console.log(`   - Home:     http://localhost:${PORT}/`);
    console.log(`   - About:    http://localhost:${PORT}/about`);
    console.log(`   - API:      http://localhost:${PORT}/api/books`);
    console.log(`   - Filter:   http://localhost:${PORT}/api/books?category=IT&limit=2`);
    console.log(`   - Download: http://localhost:${PORT}/download`);
    console.log(`   - Logs:     ./logs/access.log`);
    console.log(`====================================================`);
  });
}).catch((err: Error) => {
  console.error("Failed to initialize logs directory:", err);
  process.exit(1);
});

export default server;
