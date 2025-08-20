// Backend/store.js
// Temporary in-memory store. Replace with DB in production.
export const orders = new Map();    // map razorpay_order_id -> { productId, amount, name, email }
export const usedTokens = new Set(); // to optionally block reused download tokens