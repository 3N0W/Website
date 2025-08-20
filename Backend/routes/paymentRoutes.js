// Backend/routes/paymentRoutes.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// DB init (payments.db in Backend folder)
let db;
(async () => {
  db = await open({
    filename: path.resolve(process.cwd(), "Backend", "payments.db"),
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE,
      payment_id TEXT,
      signature TEXT,
      product_id TEXT,
      email TEXT,
      status TEXT,
      token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// Product catalog (server authority)
const PRODUCTS = {
  "prod_1": { id: "prod_1", name: "Product 1", price: 299, file: "product-1.pdf" },
  "prod_2": { id: "prod_2", name: "Product 2", price: 299, file: "product-2.pdf" }
};

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET
});

if (!razorpay) {
  console.warn("Razorpay keys not configured. Set env RAZORPAY_KEY and RAZORPAY_SECRET.");
}

// Create order - server determines price from PRODUCTS
router.post("/create-order", async (req, res) => {
  try {
    const { productId, buyer } = req.body || {};
    if (!productId || !PRODUCTS[productId]) return res.status(400).json({ error: "Invalid productId" });

    const product = PRODUCTS[productId];
    const amountPaise = product.price * 100;

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${productId}`,
      notes: { productId, buyerEmail: buyer?.email || "", buyerName: buyer?.name || "" }
    });

    // store order pending
    await db.run(
      `INSERT INTO payments (order_id, product_id, email, status) VALUES (?, ?, ?, ?)`,
      [order.id, productId, buyer?.email || "", "pending"]
    );

    return res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("Create-order error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// Verify payment and issue short-lived token/downloadUrl
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.warn("Signature mismatch for order:", razorpay_order_id);
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    const record = await db.get("SELECT * FROM payments WHERE order_id = ?", [razorpay_order_id]);
    if (!record) {
      console.warn("Order not found in DB:", razorpay_order_id);
      return res.status(400).json({ success: false, error: "Unknown order" });
    }

    // Update DB with payment info and mark verified
    await db.run(
      `UPDATE payments SET payment_id = ?, signature = ?, status = ? WHERE order_id = ?`,
      [razorpay_payment_id, razorpay_signature, "verified", razorpay_order_id]
    );

    // generate short-lived token (use random hex) and store
    const token = crypto.randomBytes(20).toString("hex");
    await db.run(`UPDATE payments SET token = ? WHERE order_id = ?`, [token, razorpay_order_id]);

    // build download URL - production should be https + proper domain; here we return relative if behind proxy
    const apiBase = process.env.NODE_ENV === "production"
      ? "" // if your API is proxied, relative path is fine
      : `http://localhost:${process.env.PORT || 5000}`;

    // Look up product id and file
    const productId = record.product_id;
    const product = PRODUCTS[productId];
    if (!product) {
      return res.status(500).json({ success: false, error: "Product metadata missing" });
    }

    const downloadUrl = `${apiBase}/api/payment/download/${productId}?token=${token}`;

    return res.json({ success: true, downloadUrl });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ success: false, error: "Verification failed" });
  }
});

// Secure download route
router.get("/download/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { token } = req.query;
    if (!productId || !token) return res.status(400).send("Missing params");

    // find matching verified payment with token and productId
    const row = await db.get(
      `SELECT * FROM payments WHERE product_id = ? AND token = ? AND status = ?`,
      [productId, token, "verified"]
    );
    if (!row) return res.status(403).send("Invalid or expired link");

    // OPTIONAL: single-use behavior - delete token after use
    await db.run(`UPDATE payments SET token = ?, status = ? WHERE order_id = ?`, ["", "delivered", row.order_id]);

    // stream file from secure folder
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const SECURE_DIR = path.resolve(__dirname, "..", "secure-files");
    const filePath = path.join(SECURE_DIR, PRODUCTS[productId].file);

    // ensure file exists by attempting to send
    return res.download(filePath, PRODUCTS[productId].file, (err) => {
      if (err) {
        console.error("File send error:", err);
        // restore token if you prefer, or log the failure
      }
    });
  } catch (err) {
    console.error("Download route error:", err);
    return res.status(500).send("Failed to process download");
  }
});

export default router;