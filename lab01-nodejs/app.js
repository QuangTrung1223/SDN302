import os from "os";
import path from "path";
import dayjs from "dayjs";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import {
    formatPrice,
    applyDiscount,
    isValidISBN
} from "./bookUtils-esm.mjs";

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);

async function testMongoDBCollection() {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || "SDN302";

    if (!uri) {
        throw new Error("Missing MONGO_URI in .env");
    }

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        await db.admin().ping();

        console.log("\nMongoDB Connection");
        console.log("Status: Connected successfully");

        const books = db.collection("books");
        const sampleBook = {
            title: "Node.js Lab 01",
            author: "Nguyen Le Quang Trung",
            isbn: "9781234567890",
            price: 50,
            discountPercent: 10,
            discountedPrice: applyDiscount(50, 10),
            updatedAt: new Date()
        };

        const result = await books.updateOne(
            { isbn: sampleBook.isbn },
            {
                $set: sampleBook,
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );
        const savedBook = await books.findOne({ isbn: sampleBook.isbn });

        console.log("\nMongoDB Collection Test");
        console.log("Database:", dbName);
        console.log("Collection: books");
        console.log("Document ID:", savedBook._id.toString());
        console.log("Saved Title:", savedBook.title);
        console.log("Upserted:", result.upsertedCount === 1 ? "Yes" : "No");
    } finally {
        await client.close();
    }
}

async function main() {
    // ===============================
    // Student information
    // ===============================
    const fullName = "Nguyen Le Quang Trung";
    const studentCode = "DS190284";

    console.log("=================================");
    console.log("BookNest - Node.js Lab 01");
    console.log("=================================");
    console.log("Full Name:", fullName);
    console.log("Student Code:", studentCode);
    console.log("Current Date:", new Date().toLocaleDateString());

    // ===============================
    // Command-line arguments
    // ===============================
    const num1 = Number(process.argv[2]);
    const num2 = Number(process.argv[3]);

    console.log("\nArithmetic Operations");

    console.log("Number 1:", num1);
    console.log("Number 2:", num2);

    console.log("Sum:", num1 + num2);
    console.log("Difference:", num1 - num2);
    console.log("Product:", num1 * num2);

    if (num2 !== 0) {
        console.log("Quotient:", num1 / num2);
    } else {
        console.log("Quotient: Cannot divide by zero");
    }

    // ===============================
    // Operating System information
    // ===============================
    console.log("\nSystem Information");

    console.log("Platform:", os.platform());
    console.log("CPU Count:", os.cpus().length);
    console.log("Free Memory:", os.freemem());

    // ===============================
    // Current file path
    // ===============================
    console.log("\nFile Information");

    console.log("Absolute File Path:", path.resolve(__filename));

    console.log("\nBookNest Utilities");

    const price = 50;
    const discountPrice = applyDiscount(price, 10);

    console.log("Original Price:", formatPrice(price));
    console.log("Discounted Price:", formatPrice(discountPrice));
    console.log("ISBN Valid:", isValidISBN("9781234567890"));
    console.log("Formatted Date:", dayjs().format("YYYY-MM-DD HH:mm:ss"));

    await testMongoDBCollection();
}

main().catch((error) => {
    console.error("\nApplication Error");
    console.error(error.message);
    process.exit(1);
});
