import express from "express";

export const PRODUCTS = {
  prod_1: {
    id: "prod_1",
    name: "The Life of a Dot",
    price: 299,
    file: "product-1.pdf",
    image: "/Images/prod1.png",
    description: "Bibliography of a dot learning. The quote is Sequence of Consequences"
  },
  prod_2: {
    id: "prod_2",
    name: "WHY?",
    price: 299,
    file: "product-2.pdf",
    image: "/Images/prod2.png",
    description: "The philosophy of standing against what we approve"
  }
};

const router = express.Router();

// Return **array** of products
router.get("/", (req, res) => {
  res.json({ success: true, data: Object.values(PRODUCTS) });
});

export default router;