import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import Razorpay from "razorpay";

import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./product.js";
import downloadRoutes from "./downloadRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";

// Check essential env variables
const REQUIRED_ENVS = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "DOWNLOAD_JWT_SECRET", "ALLOWED_ORIGIN"];
REQUIRED_ENVS.forEach((v) => {
  if (!process.env[v]) throw new Error(`${v} is not defined in .env`);
});

console.log("Loaded env variables successfully.");

// Initialize Express
const app = express();
app.use(express.json());

// CORS: only allow your domain
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  })
);

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API Routes
app.use("/api/payment", paymentRoutes(razorpay));
app.use("/api/products", productRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/affiliate", affiliateRoutes());

// Serve static images
app.use("/Images", express.static("src/Images"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));