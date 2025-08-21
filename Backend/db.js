import fs from "fs";
import path from "path";

const paymentsFile = path.resolve(process.cwd(), "Backend", "payments.json");

// ----------- Internal Helpers -----------
function loadPayments() {
  if (!fs.existsSync(paymentsFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(paymentsFile, "utf8"));
  } catch (e) {
    console.error("⚠️ Failed to read payments.json:", e);
    return [];
  }
}

function savePayments(payments) {
  fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2));
}

// ----------- Public API -----------
export function addPayment(record) {
  const payments = loadPayments();
  payments.push(record);
  savePayments(payments);
}

export function updatePayment(orderId, updates) {
  const payments = loadPayments();
  const idx = payments.findIndex(p => p.order_id === orderId);
  if (idx !== -1) {
    payments[idx] = { ...payments[idx], ...updates };
    savePayments(payments);
  }
}

export function getPayment(orderId) {
  return loadPayments().find(p => p.order_id === orderId) || null;
}

export function getPaymentByToken(productId, token) {
  return loadPayments().find(
    p => p.product_id === productId && p.token === token && p.status === "verified"
  ) || null;
}