import express from "express";
import crypto from "crypto";
import { PRODUCTS } from "../product.js";
import { addPayment, updatePayment, getPayment, getAllPayments, getAffiliateByCode, addAffiliateSale } from "../db.js";
import { generateDownloadToken } from "../downloadRoutes.js";

export default function paymentRoutes(razorpay) {
  const router = express.Router();

  // Create Razorpay order
  router.post("/create-order", async (req, res) => {
    try {
      const { productId, buyer, affiliate } = req.body || {};
      if (!productId || !PRODUCTS[productId]) return res.status(400).json({ success: false, error: "Invalid productId" });

      const product = PRODUCTS[productId];
      let affiliateCode = null;
      if (affiliate && getAffiliateByCode(affiliate)) affiliateCode = affiliate;

      const order = await razorpay.orders.create({
        amount: product.price * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${productId}`,
        notes: { productId, buyerEmail: buyer?.email || "", buyerName: buyer?.name || "", affiliate: affiliateCode }
      });

      addPayment({ order_id: order.id, product_id: productId, email: buyer?.email || "", status: "pending", affiliate: affiliateCode, created_at: new Date().toISOString() });
      res.json({ success: true, data: { id: order.id, amount: order.amount, currency: order.currency } });
    } catch (err) {
      console.error("Create-order error:", err);
      res.status(500).json({ success: false, error: "Failed to create order" });
    }
  });

  // Verify payment + generate download token
  router.post("/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
        return res.status(400).json({ success: false, error: "Missing fields" });

      const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) return res.status(400).json({ success: false, error: "Invalid signature" });

      const record = getPayment(razorpay_order_id);
      if (!record || record.status === "verified") return res.status(400).json({ success: false, error: "Unknown or already verified order" });

      // Generate JWT download token
      const downloadToken = generateDownloadToken(record.product_id);
      updatePayment(razorpay_order_id, { payment_id: razorpay_payment_id, signature: razorpay_signature, status: "verified", downloadToken });

      // Affiliate tracking
      if (record.affiliate) addAffiliateSale(record.affiliate, PRODUCTS[record.product_id].price);

      const apiBase = process.env.API_BASE || ""; // configure in .env
      const downloadUrl = `${apiBase}/api/download/${downloadToken}`;

      res.json({ success: true, data: { downloadUrl } });
    } catch (err) {
      console.error("Verify error:", err);
      res.status(500).json({ success: false, error: "Verification failed" });
    }
  });

  // GET products
  router.get("/products", (req, res) => {
    try { res.json({ success: true, data: Object.values(PRODUCTS) }); }
    catch (err) { console.error(err); res.status(500).json({ success: false, error: "Failed to fetch products" }); }
  });

  // GET all payments (admin)
  router.get("/", (req, res) => {
    try {
      const token = req.headers["x-admin-token"] || (req.headers.authorization || "").replace("Bearer ", "");
      if (token !== process.env.ADMIN_TOKEN) return res.status(403).json({ success: false, error: "Forbidden" });
      res.json({ success: true, data: getAllPayments() });
    } catch (err) { console.error(err); res.status(500).json({ success: false, error: "Failed to fetch payments" }); }
  });

  return router;
}