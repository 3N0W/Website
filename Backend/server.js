import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import Razorpay from "razorpay";

import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./product.js";
import downloadRoutes from "./downloadRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";

console.log("ENV ADMIN_TOKEN:", process.env.ADMIN_TOKEN);

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.ALLOWED_ORIGIN || "*",
    ],
    credentials: true,
  })
);

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ----------- Routes -----------
app.use("/api/payment", paymentRoutes(razorpay)); // pass Razorpay instance
app.use("/api/products", productRoutes);          // products list
app.use("/api/download", downloadRoutes);         // secure download
app.use("/api/affiliate", affiliateRoutes());     // function call, not reference

// Optional: serve static images
app.use("/Images", express.static("src/Images"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));