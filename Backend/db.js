import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ db.json will be created in ~/zorgath/Backend/
const DB_FILE = path.join(__dirname, "db.json");

// Load or initialize DB
let db = { affiliates: [], payments: [] };
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (e) {
    console.error("Failed to parse db.json, initializing new DB.");
  }
}

// --- Save helper ---
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

// --- Affiliates ---
export function getAffiliates() {
  return db.affiliates;
}

export function addAffiliate(name) {
  const code = `aff_${Math.random().toString(36).substring(2, 8)}`;
  const newAff = { name, code, sales: 0, revenue: 0 };
  db.affiliates.push(newAff);
  saveDB();
  return code;
}

export function getAffiliateByCode(code) {
  return db.affiliates.find((a) => a.code === code);
}

export function addAffiliateSale(code, amount) {
  const aff = getAffiliateByCode(code);
  if (!aff) return null;
  aff.sales += 1;
  aff.revenue += amount;
  saveDB();
  return aff;
}

// --- Payments ---
export function addPayment(payment) {
  db.payments.push(payment);
  saveDB();
}

export function updatePayment(orderId, updates) {
  const record = db.payments.find((p) => p.order_id === orderId);
  if (!record) return null;
  Object.assign(record, updates);
  saveDB();
  return record;
}

export function getPayment(orderId) {
  return db.payments.find((p) => p.order_id === orderId);
}

export function getPaymentByToken(productId, token) {
  return db.payments.find((p) => p.product_id === productId && p.token === token);
}

// --- Get All Payments (for Admin) ---
export function getAllPayments() {
  return db.payments;
}