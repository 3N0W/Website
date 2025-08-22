import fs from "fs";
import path from "path";

const paymentsFile = path.resolve(process.cwd(), "Backend", "payments.json");
const affiliatesFile = path.resolve(process.cwd(), "Backend", "affiliates.json");

// ----------- Payments Helpers -----------
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

// ----------- Affiliates Helpers -----------
function loadAffiliates() {
  if (!fs.existsSync(affiliatesFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(affiliatesFile, "utf8"));
  } catch (e) {
    console.error("⚠️ Failed to read affiliates.json:", e);
    return [];
  }
}

function saveAffiliates(data) {
  fs.writeFileSync(affiliatesFile, JSON.stringify(data, null, 2));
}

// ----------- Payments API -----------
export function addPayment(record) {
  const payments = loadPayments();
  payments.push(record);
  savePayments(payments);
}

export function updatePayment(orderId, updates) {
  const payments = loadPayments();
  const idx = payments.findIndex((p) => p.order_id === orderId);
  if (idx !== -1) {
    payments[idx] = { ...payments[idx], ...updates };
    savePayments(payments);
  }
}

export function getPayment(orderId) {
  return loadPayments().find((p) => p.order_id === orderId) || null;
}

export function getPaymentByToken(productId, token) {
  return (
    loadPayments().find(
      (p) => p.product_id === productId && p.token === token && p.status === "verified"
    ) || null
  );
}

// ----------- Affiliate API -----------
export function addAffiliate(name) {
  const data = loadAffiliates();
  const code = Math.random().toString(36).substring(2, 8);
  if (!data.find((a) => a.code === code)) {
    data.push({ name, code, sales: 0, revenue: 0 });
  }
  saveAffiliates(data);
  return code;
}

export function addAffiliateSale(code, amount) {
  const data = loadAffiliates();
  const aff = data.find((a) => a.code === code);
  if (aff) {
    aff.sales++;
    aff.revenue += amount;
    saveAffiliates(data);
    return aff;
  }
  return null;
}

export function getAffiliateByCode(code) {
  return loadAffiliates().find((a) => a.code === code) || null;
}

export function getAffiliates() {
  return loadAffiliates();
}