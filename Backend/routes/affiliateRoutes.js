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
    const data = getAffiliates();
    res.json(data);
  });

  // POST - add affiliate
  router.post("/", (req, res) => {
    const { ref } = req.body;
    if (!ref) return res.status(400).json({ error: "ref is required" });
    addAffiliate(ref);
    res.status(201).json({ message: "Affiliate added", ref });
  });

  return router;
}