import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

let db = { affiliates: [], payments: [] };
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    console.error("Failed to parse db.json, initializing new DB.");
  }
}

const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

// Affiliates
export function getAffiliates() { return db.affiliates; }
export function addAffiliate(name) {
  const code = `aff_${Math.random().toString(36).substring(2, 8)}`;
  const newAff = { name, code, sales: 0, revenue: 0 };
  db.affiliates.push(newAff);
  saveDB();
  return newAff;
}
export function getAffiliateByCode(code) { return db.affiliates.find(a => a.code === code); }
export function addAffiliateSale(code, amount) {
  const aff = getAffiliateByCode(code);
  if (!aff) return null;
  aff.sales += 1;
  aff.revenue += amount;
  saveDB();
  return aff;
}

// Payments
export function addPayment(payment) { db.payments.push(payment); saveDB(); return payment; }
export function updatePayment(orderId, updates) {
  const rec = db.payments.find(p => p.order_id === orderId);
  if (!rec) return null;
  Object.assign(rec, updates);
  saveDB();
  return rec;
}
export function getPayment(orderId) { return db.payments.find(p => p.order_id === orderId); }
export function getPaymentByToken(token) { return db.payments.find(p => p.downloadToken === token); }
export function getAllPayments() { return db.payments; }