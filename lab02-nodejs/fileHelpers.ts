import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Book, CallbackFn } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BOOKS_FILE_PATH: string = path.join(__dirname, "books.json");
export const LOGS_DIR_PATH: string = path.join(__dirname, "logs");
export const ACCESS_LOG_FILE_PATH: string = path.join(LOGS_DIR_PATH, "access.log");

/**
 * ============================================================
 * 1. Callback Style Helpers (fs.readFile / fs.writeFile)
 * ============================================================
 */

/**
 * Read books.json using fs.readFile (Callback style)
 * @param callback Callback function returning (err, books)
 */
export function readBooksCallback(callback: CallbackFn<Book[]>): void {
  fs.readFile(BOOKS_FILE_PATH, "utf-8", (err, data) => {
    if (err) {
      return callback(err, null);
    }
    try {
      const books: Book[] = JSON.parse(data);
      callback(null, books);
    } catch (parseError) {
      callback(parseError as Error, null);
    }
  });
}

/**
 * Write books array to books.json using fs.writeFile (Callback style)
 * @param books Array of Book entities
 * @param callback Callback function returning (err)
 */
export function writeBooksCallback(books: Book[], callback: (err: Error | null) => void): void {
  try {
    const jsonString = JSON.stringify(books, null, 2);
    fs.writeFile(BOOKS_FILE_PATH, jsonString, "utf-8", (err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  } catch (stringifyError) {
    callback(stringifyError as Error);
  }
}

/**
 * ============================================================
 * 2. Promise / Async-Await Style Helpers (fs.promises)
 * ============================================================
 */

/**
 * Read books.json using fsPromises (Async/Await style)
 * @returns Promise resolving to array of Book entities
 */
export async function readBooksAsync(): Promise<Book[]> {
  const rawData = await fsPromises.readFile(BOOKS_FILE_PATH, "utf-8");
  return JSON.parse(rawData) as Book[];
}

/**
 * Write books array to books.json using fsPromises (Async/Await style)
 * @param books Array of Book entities
 */
export async function writeBooksAsync(books: Book[]): Promise<void> {
  const jsonString = JSON.stringify(books, null, 2);
  await fsPromises.writeFile(BOOKS_FILE_PATH, jsonString, "utf-8");
}

/**
 * ============================================================
 * 3. Access Logger Helpers
 * ============================================================
 */

/**
 * Ensure logs/ directory exists at startup
 */
export async function initLogsDir(): Promise<void> {
  await fsPromises.mkdir(LOGS_DIR_PATH, { recursive: true });
}

/**
 * Append an access log line to logs/access.log
 * Format: [YYYY-MM-DDTHH:mm:ss.sssZ] METHOD URL
 * @param method HTTP Method
 * @param url Requested URL path
 */
export async function logAccess(method: string, url: string): Promise<void> {
  try {
    await initLogsDir();
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${method} ${url}\n`;
    await fsPromises.appendFile(ACCESS_LOG_FILE_PATH, logLine, "utf-8");
  } catch (error) {
    console.error("Failed to write access log:", (error as Error).message);
  }
}
