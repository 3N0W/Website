import express from "express";
import { addAffiliate, addAffiliateSale, getAffiliates } from "../db.js";

export default function affiliateRoutes() {
  const router = express.Router();

  // Middleware: admin auth
  router.use((req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = req.headers["x-admin-token"] || authHeader.replace("Bearer ", "");

    const expected = process.env.ADMIN_TOKEN || "supersecret";
    console.log("🔑 Incoming admin token:", token);
    console.log("🔑 Expected ADMIN_TOKEN:", expected);

    if (token !== expected) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    next();
  });

  // GET all affiliates
  router.get("/", (req, res) => {
    try {
      const data = getAffiliates();
      res.json({ success: true, data });
    } catch (err) {
      console.error("Error fetching affiliates:", err);
      res.status(500).json({ success: false, error: "Failed to fetch affiliates" });
    }
  });

  // POST - create affiliate
  router.post("/create", (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: "name is required" });
      }

      const code = addAffiliate(name);
      res.status(201).json({ success: true, data: { code, name } });
    } catch (err) {
      console.error("Error creating affiliate:", err);
      res.status(500).json({ success: false, error: "Failed to create affiliate" });
    }
  });

  // POST - record a sale
  router.post("/sale", (req, res) => {
    try {
      const { code, amount } = req.body;
      const parsedAmount = parseFloat(amount);

      if (!code || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, error: "code and valid amount required" });
      }

      const updated = addAffiliateSale(code, parsedAmount);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Affiliate not found" });
      }

      res.json({ success: true, message: "Sale recorded", data: updated });
    } catch (err) {
      console.error("Error recording sale:", err);
      res.status(500).json({ success: false, error: "Failed to record sale" });
    }
  });

  return router;
}