import express from "express";
import { addAffiliate, addAffiliateSale, getAffiliates } from "../db.js";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "supersecret";

router.use((req, res, next) => {
  if (req.method !== "GET" && req.headers["x-admin-token"] !== ADMIN_TOKEN)
    return res.status(403).json({ error: "Forbidden" });
  if (req.method === "GET" && req.headers["x-admin-token"] !== ADMIN_TOKEN)
    return res.status(403).json({ error: "Forbidden" });
  next();
});
export default function affiliateRoutes() {
  const router = express.Router();

  // Middleware: Admin token protection
  router.use((req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: "Unauthorized" });
    next();
  });

  // GET all affiliates
  router.get("/", (req, res) => {
    const data = getAffiliates();
    res.json(data);
  });

  return router;
}