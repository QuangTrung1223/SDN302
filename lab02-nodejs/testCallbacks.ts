import { readBooksCallback, writeBooksCallback } from "./fileHelpers.js";
import type { Book } from "./types.js";

console.log("====================================================");
console.log("Testing Callback-Style File System Helpers (Req 4)");
console.log("====================================================");

readBooksCallback((err: Error | null, books?: Book[] | null) => {
  if (err || !books) {
    console.error("❌ readBooksCallback Error:", err ? err.message : "No books returned");
    process.exit(1);
  }

  console.log(`✅ readBooksCallback Success: Read ${books.length} books.`);
  console.log("Sample book title:", books[0]?.title);

  // Demonstrate writing back (callback style)
  console.log("\nTesting writeBooksCallback...");
  writeBooksCallback(books, (writeErr: Error | null) => {
    if (writeErr) {
      console.error("❌ writeBooksCallback Error:", writeErr.message);
      process.exit(1);
    }
    console.log("✅ writeBooksCallback Success: Verified writing to books.json.");
    console.log("All callback-style helpers passed successfully!");
  });
});
