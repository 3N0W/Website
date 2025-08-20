// Backend/downloadRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { getProduct } from "../products.js";
import { usedTokens } from "../store.js";
import { fileURLToPath } from "url";

const router = express.Router();
const { DOWNLOAD_JWT_SECRET } = process.env;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// secure-files directory (put your PDFs here)
const SECURE_DIR = path.resolve(__dirname, "..", "secure-files");

router.get("/:token", (req, res) => {
  try {
    const { token } = req.params;
    const payload = jwt.verify(token, DOWNLOAD_JWT_SECRET);

    // Optional single-use protection
    if (payload.jti && usedTokens.has(payload.jti)) {
      return res.status(410).json({ error: "Link already used" });
    }
    if (payload.jti) usedTokens.add(payload.jti);

    const product = getProduct(payload.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const filePath = path.join(SECURE_DIR, product.file);

    res.setHeader("Content-Disposition", `attachment; filename="${product.file}"`);
    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(filePath);
  } catch (err) {
    console.error("Download token error:", err?.message || err);
    return res.status(401).json({ error: "Invalid or expired link" });
  }
});

export default router;