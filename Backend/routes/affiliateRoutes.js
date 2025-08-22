// routes/affiliateRoutes.js
import express from "express";
import { addAffiliate, addAffiliateSale, getAffiliates } from "../db.js";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "supersecret";

export default function affiliateRoutes() {
  const router = express.Router();

  // Middleware: Protect all routes with admin token
  router.use((req, res, next) => {
    const token = req.headers["x-admin-token"] || req.headers.authorization?.split(" ")[1];
    if (token !== ADMIN_TOKEN) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });

  // GET all affiliates
  router.get("/", (req, res) => {
    try {
      const data = getAffiliates();
      res.json(data);
    } catch (err) {
      console.error("Error fetching affiliates:", err);
      res.status(500).json({ error: "Failed to fetch affiliates" });
    }
  });

  // POST - create affiliate
  router.post("/create", (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });

      const code = addAffiliate(name); // should return unique code from db.js
      res.status(201).json({ code, name });
    } catch (err) {
      console.error("Error creating affiliate:", err);
      res.status(500).json({ error: "Failed to create affiliate" });
    }
  });

  // POST - record a sale for affiliate
  router.post("/sale", (req, res) => {
    try {
      const { code, amount } = req.body;
      if (!code || !amount) return res.status(400).json({ error: "code and amount are required" });

      const updated = addAffiliateSale(code, amount); // db.js must handle incrementing sales + revenue
      if (!updated) return res.status(404).json({ error: "Affiliate not found" });

      res.json({ message: "Sale recorded", affiliate: updated });
    } catch (err) {
      console.error("Error recording sale:", err);
      res.status(500).json({ error: "Failed to record sale" });
    }
  });

  return router;
}