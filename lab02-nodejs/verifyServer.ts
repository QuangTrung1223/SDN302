import { server } from "./server.js";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Book } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVerification(): Promise<void> {
  console.log("Waiting 500ms for server startup...");
  await new Promise((resolve) => setTimeout(resolve, 500));

  const PORT = Number(process.env.PORT) || 3000;
  const baseUrl = `http://localhost:${PORT}`;
  let passedCount = 0;
  let totalTests = 0;

  async function assertTest(name: string, fn: () => Promise<void>): Promise<void> {
    totalTests++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, (err as Error).message);
    }
  }

  // Test 1: GET /
  await assertTest("GET / returns 200 and text/html", async () => {
    const res = await fetch(`${baseUrl}/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cType = res.headers.get("content-type");
    if (!cType?.includes("text/html")) throw new Error(`Expected text/html, got ${cType}`);
    const html = await res.text();
    if (!html.includes("BookNest")) throw new Error("Missing 'BookNest' in homepage HTML");
  });

  // Test 2: GET /about
  await assertTest("GET /about returns 200 and text/html", async () => {
    const res = await fetch(`${baseUrl}/about`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cType = res.headers.get("content-type");
    if (!cType?.includes("text/html")) throw new Error(`Expected text/html, got ${cType}`);
    const html = await res.text();
    if (!html.includes("About BookNest")) throw new Error("Missing 'About BookNest' in HTML");
  });

  // Test 3: GET /api/books (returns >= 5 books)
  await assertTest("GET /api/books returns 200 and array of >= 5 books", async () => {
    const res = await fetch(`${baseUrl}/api/books`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cType = res.headers.get("content-type");
    if (!cType?.includes("application/json")) throw new Error(`Expected application/json, got ${cType}`);
    const books = (await res.json()) as Book[];
    if (!Array.isArray(books) || books.length < 5) {
      throw new Error(`Expected array with at least 5 books, got ${books?.length}`);
    }
  });

  // Test 4: GET /api/books?category=IT&limit=2
  await assertTest("GET /api/books?category=IT&limit=2 filters correctly", async () => {
    const res = await fetch(`${baseUrl}/api/books?category=IT&limit=2`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const books = (await res.json()) as Book[];
    if (books.length !== 2) throw new Error(`Expected limit 2, got ${books.length}`);
    if (books.some((b) => b.category !== "IT")) throw new Error("Expected all books to have category IT");
  });

  // Test 5: POST /api/books (returns 201 and persists to file)
  await assertTest("POST /api/books creates book and returns 201 Created", async () => {
    const newBook = {
      title: "Node.js TypeScript Patterns",
      author: "Mario Casciaro",
      category: "IT",
      price: 49.99,
      stock: 12
    };

    const res = await fetch(`${baseUrl}/api/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook)
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const created = (await res.json()) as Book;
    if (!created.id || created.title !== newBook.title) {
      throw new Error("Created book payload mismatch");
    }

    // Verify persistence in books.json
    const rawData = await fsPromises.readFile(path.join(__dirname, "books.json"), "utf-8");
    const allBooks = JSON.parse(rawData) as Book[];
    const found = allBooks.find((b) => b.id === created.id);
    if (!found) throw new Error("Newly created book not found in books.json");
  });

  // Test 6: 405 Method Not Allowed
  await assertTest("PUT /api/books returns 405 Method Not Allowed", async () => {
    const res = await fetch(`${baseUrl}/api/books`, { method: "PUT" });
    if (res.status !== 405) throw new Error(`Expected 405, got ${res.status}`);
    const allowHeader = res.headers.get("allow");
    if (!allowHeader?.includes("GET") || !allowHeader?.includes("POST")) {
      throw new Error(`Expected Allow header with GET, POST, got: ${allowHeader}`);
    }
  });

  // Test 7: GET /download (Attachment header)
  await assertTest("GET /download sends attachment with Content-Disposition", async () => {
    const res = await fetch(`${baseUrl}/download`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const disposition = res.headers.get("content-disposition");
    if (!disposition?.includes("attachment")) {
      throw new Error(`Expected Content-Disposition: attachment, got: ${disposition}`);
    }
    const text = await res.text();
    if (!text.includes("BOOKNEST")) throw new Error("Download content missing header");
  });

  // Test 8: Static File Serving (style.css & SVG)
  await assertTest("Static file serving for CSS and SVG", async () => {
    const cssRes = await fetch(`${baseUrl}/style.css`);
    if (cssRes.status !== 200) throw new Error(`Expected 200 for CSS, got ${cssRes.status}`);
    if (!cssRes.headers.get("content-type")?.includes("text/css")) {
      throw new Error("Wrong MIME type for CSS");
    }

    const svgRes = await fetch(`${baseUrl}/booknest-banner.svg`);
    if (svgRes.status !== 200) throw new Error(`Expected 200 for SVG, got ${svgRes.status}`);
    if (!svgRes.headers.get("content-type")?.includes("image/svg+xml")) {
      throw new Error("Wrong MIME type for SVG");
    }
  });

  // Test 9: 404 Route
  await assertTest("Unknown route returns 404 Not Found", async () => {
    const res = await fetch(`${baseUrl}/non-existent-page-xyz`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // Test 10: Access Log Verification
  await assertTest("logs/access.log contains recorded requests", async () => {
    const logPath = path.join(__dirname, "logs", "access.log");
    const logContent = await fsPromises.readFile(logPath, "utf-8");
    if (!logContent.includes("GET /api/books") || !logContent.includes("POST /api/books")) {
      throw new Error("Access log did not contain expected request entries");
    }
  });

  console.log("\n====================================================");
  console.log(`Verification Summary: ${passedCount}/${totalTests} tests passed.`);
  console.log("====================================================");

  server.close(() => {
    console.log("Server stopped after verification.");
    process.exit(passedCount === totalTests ? 0 : 1);
  });
}

runVerification().catch((err: Error) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
