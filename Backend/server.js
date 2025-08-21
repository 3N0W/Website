import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./product.js";   
import downloadRoutes from "./downloadRoutes.js";

dotenv.config();

const app = express();   // <-- app must be created before using it
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));

// Register routes after app is defined
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/download", downloadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));