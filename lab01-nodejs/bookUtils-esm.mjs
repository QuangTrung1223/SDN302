export function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

export function applyDiscount(price, discountPercent) {
    return price - (price * discountPercent / 100);
}

export function isValidISBN(isbn) {
    return typeof isbn === "string" && isbn.length >= 10;
}