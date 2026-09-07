import {
    formatPrice,
    applyDiscount,
    isValidISBN
} from "./bookUtils-esm.mjs";

const price = 50;

console.log("BookNest - ES Module Version");

console.log("Original Price:", formatPrice(price));

const discountedPrice = applyDiscount(price, 10);

console.log("Discounted Price:", formatPrice(discountedPrice));

console.log("ISBN Valid:", isValidISBN("9781234567890"));