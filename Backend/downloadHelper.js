import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const { DOWNLOAD_JWT_SECRET } = process.env;
if (!DOWNLOAD_JWT_SECRET) throw new Error("DOWNLOAD_JWT_SECRET not defined");

/**
 * Generate a one-time download token for a product
 * @param {string} productId
 * @param {number} expiresInSeconds
 * @returns {string} JWT token
 */
export function generateDownloadToken(productId, expiresInSeconds = 3600) {
  const payload = {
    productId,
    jti: uuidv4(),
  };

  return jwt.sign(payload, DOWNLOAD_JWT_SECRET, { expiresIn: expiresInSeconds });
}