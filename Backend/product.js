// Backend/product.js
import express from "express";

export const PRODUCTS = {
  "prod_1": { id: "prod_1", name: "Product 1", price: 299, file: "product-1.pdf" },
  "prod_2": { id: "prod_2", name: "Product 2", price: 299, file: "product-2.pdf" }
};

const router = express.Router();

// GET all products
router.get("/", (req, res) => {
  res.json(PRODUCTS);
});

export default router;