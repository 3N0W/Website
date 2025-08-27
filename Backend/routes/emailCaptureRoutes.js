import express from "express";
import nodemailer from "nodemailer";
import { PRODUCTS } from "../product.js";

const router = express.Router();

// Configure nodemailer (using Gmail SMTP as example, you can switch to any SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// 5 humanized points per product
const PRODUCT_POINTS = {
  prod_1: [
    "Discover the journey of a single dot and its ripple effect.",
    "Learn how small actions trigger huge consequences.",
    "A concise, philosophical take on self-awareness.",
    "Perfect for quick reflection and daily inspiration.",
    "Comes with a downloadable PDF to revisit anytime."
  ],
  prod_2: [
    "Challenge what you accept blindly.",
    "Philosophical insights on questioning authority and norms.",
    "A compact guide to critical thinking.",
    "Readable and engaging—no fluff, only clarity.",
    "Includes a downloadable version for easy reference."
  ]
};

// POST /api/email-capture
router.post("/", async (req, res) => {
  try {
    const { name, email, affiliate, productId } = req.body;
    if (!name || !email || !productId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const product = PRODUCTS[productId];
    if (!product) return res.status(400).json({ success: false, error: "Invalid product" });

    const points = PRODUCT_POINTS[productId] || [];

    // Construct affiliate link
    let affiliateLink = `${process.env.FRONTEND_URL}?product=${productId}`;
    if (affiliate) affiliateLink += `&affiliate=${affiliate}`;

    const emailBody = `
      <p>Hi ${name},</p>
      <p>Thanks for your interest in <strong>${product.name}</strong>! Here’s why it’s worth checking out:</p>
      <ol>
        ${points.map(p => `<li>${p}</li>`).join("")}
      </ol>
      <p>You can access it here: <a href="${affiliateLink}">Click to view</a></p>
      <p>Enjoy!</p>
      <p>- Snow Strom Team</p>
    `;

    await transporter.sendMail({
      from: `"Snow Strom" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Your ${product.name} summary & link`,
      html: emailBody,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Email capture error:", err);
    return res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

export default router;