import express from "express";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { addPayment, updatePayment, getPayment, getPaymentByToken } from "../db.js";

export default function paymentRoutes(razorpay) {
  const router = express.Router();

  const PRODUCTS = {
    prod_1: { id: "prod_1", name: "Product 1", price: 299, file: "product-1.pdf" },
    prod_2: { id: "prod_2", name: "Product 2", price: 299, file: "product-2.pdf" },
  };

  // CREATE ORDER
  router.post("/create-order", async (req, res) => {
    try {
      const { productId, buyer } = req.body || {};
      if (!productId || !PRODUCTS[productId]) return res.status(400).json({ error: "Invalid productId" });

      const product = PRODUCTS[productId];

      const order = await razorpay.orders.create({
        amount: product.price * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${productId}`,
      });

      addPayment({
        order_id: order.id,
        product_id: productId,
        email: buyer?.email || "",
        status: "pending",
        created_at: new Date().toISOString(),
      });

      res.json({ id: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
      console.error("Create order error:", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // VERIFY PAYMENT
  router.post("/verify", (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
        return res.status(400).json({ success: false, error: "Missing fields" });

      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) return res.status(400).json({ success: false, error: "Invalid signature" });

      const record = getPayment(razorpay_order_id);
      if (!record) return res.status(400).json({ success: false, error: "Unknown order" });

      const token = crypto.randomBytes(20).toString("hex");
      updatePayment(razorpay_order_id, { payment_id: razorpay_payment_id, signature: razorpay_signature, status: "verified", token });

      const apiBase = process.env.NODE_ENV === "production" ? "" : `http://<YOUR_PHONE_IP>:${process.env.PORT || 5000}`;
      const product = PRODUCTS[record.product_id];
      const downloadUrl = `${apiBase}/api/payment/download/${record.product_id}?token=${token}`;

      res.json({ success: true, downloadUrl });
    } catch (err) {
      console.error("Verify payment error:", err);
      res.status(500).json({ success: false, error: "Verification failed" });
    }
  });

  // DOWNLOAD FILE
  router.get("/download/:productId", (req, res) => {
    try {
      const { productId } = req.params;
      const { token } = req.query;
      if (!productId || !token) return res.status(400).send("Missing params");

      const record = getPaymentByToken(productId, token);
      if (!record) return res.status(403).send("Invalid or expired link");

      updatePayment(record.order_id, { token: "", status: "delivered" });

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const SECURE_DIR = path.resolve(__dirname, "..", "secure-files");
      const filePath = path.join(SECURE_DIR, PRODUCTS[productId].file);

      res.download(filePath, PRODUCTS[productId].file);
    } catch (err) {
      console.error("Download error:", err);
      res.status(500).send("Failed to process download");
    }
  });

  return router;
}