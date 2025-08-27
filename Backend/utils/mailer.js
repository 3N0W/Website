import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use any SMTP provider
  auth: {
    user: process.env.SMTP_USER,     // set in .env
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAffiliateEmail({ name, email, affiliate, product }) {
  const affiliateLink = affiliate
    ? `https://snowstrom.shop/?affiliate=${affiliate}`
    : "https://snowstrom.shop/";

  const html = `
    <p>Hi ${name},</p>
    <p>Thanks for your interest in <strong>${product.name}</strong>! Here are 5 quick points you might like:</p>
    <ol>
      <li>${product.points[0]}</li>
      <li>${product.points[1]}</li>
      <li>${product.points[2]}</li>
      <li>${product.points[3]}</li>
      <li>${product.points[4]}</li>
    </ol>
    <p>Explore more or purchase using this link: <a href="${affiliateLink}">Get the Product</a></p>
    <p>Enjoy your journey!</p>
  `;

  await transporter.sendMail({
    from: `"Snow Strom" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Quick Insights on ${product.name}`,
    html,
  });
}