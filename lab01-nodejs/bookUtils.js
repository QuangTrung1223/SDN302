function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function applyDiscount(price, discountPercent) {
    return price - (price * discountPercent / 100);
}

function isValidISBN(isbn) {
    return typeof isbn === "string" && isbn.length >= 10;
}

module.exports = {
    formatPrice,
    applyDiscount,
    isValidISBN
};