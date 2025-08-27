import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PRODUCTS } from "./product.js";
import { usedTokens } from "./store.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Ensure env exists
const DOWNLOAD_JWT_SECRET = process.env.DOWNLOAD_JWT_SECRET;
if (!DOWNLOAD_JWT_SECRET) throw new Error("DOWNLOAD_JWT_SECRET not defined");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECURE_DIR = path.resolve(__dirname, "..", "secure-files");

// GET /api/download/:token
router.get("/:token", (req, res) => {
  try {
    const { token } = req.params;
    const payload = jwt.verify(token, DOWNLOAD_JWT_SECRET);

    // Single-use check
    if (usedTokens.has(payload.jti)) {
      return res.status(410).json({ error: "Link already used" });
    }
    usedTokens.add(payload.jti);

    const product = PRODUCTS[payload.productId];
    if (!product) return res.status(404).json({ error: "Product not found" });

    const filePath = path.join(SECURE_DIR, product.file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    res.setHeader("Content-Disposition", `attachment; filename="${product.file}"`);
    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(filePath);
  } catch (err) {
    console.error("Download error:", err?.message || err);
    return res.status(401).json({ error: "Invalid or expired link" });
  }
});

// Helper: generate download JWT
export function generateDownloadToken(productId, expiresSec = 3600) {
  return jwt.sign(
    { productId, jti: uuidv4() },
    DOWNLOAD_JWT_SECRET,
    { expiresIn: expiresSec }
  );
}

export default router;