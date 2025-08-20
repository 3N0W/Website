import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./product.js";   // expose products
import downloadRoutes from "./downloadRoutes.js"; // optional

dotenv.config();
const app = express();
app.use(express.json());

// allow frontend to call backend
app.use(cors({ origin: "http://localhost:5173" }));

// routes
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);      // serve product list
app.use("/api/download", downloadRoutes);     // serve ebooks if needed

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));