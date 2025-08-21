import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./product.js";
import downloadRoutes from "./downloadRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";

app.use("/api/affiliate", affiliateRoutes);
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Routes
app.use("/api/payment", paymentRoutes(razorpay));
app.use("/api/products", productRoutes);
app.use("/api/download", downloadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));