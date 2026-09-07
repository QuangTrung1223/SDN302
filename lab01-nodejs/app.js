const os = require("os");
const path = require("path");
const dayjs = require("dayjs");
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

const {
    formatPrice,
    applyDiscount,
    isValidISBN
} = require("./bookUtils");

console.log("\nBookNest Utilities");

const price = 50;
const discountPrice = applyDiscount(price, 10);

console.log("Original Price:", formatPrice(price));
console.log("Discounted Price:", formatPrice(discountPrice));
console.log("ISBN Valid:", isValidISBN("9781234567890"));
console.log("Formatted Date:", dayjs().format("YYYY-MM-DD HH:mm:ss"));