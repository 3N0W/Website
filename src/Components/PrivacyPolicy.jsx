// src/Components/PrivacyPolicy.jsx
import React from "react";
import "./Dashboard.css"; // or create PrivacyPolicy.css if you want custom styles

const PrivacyPolicy = () => {
  return (
    <div className="policy-container" style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Privacy Policy</h1>
      <p>
        At <strong>ZORGATH</strong>, we respect your privacy and are committed to
        protecting your personal information. This policy explains how we
        collect, use, and safeguard your data when you use our website or
        services.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We may collect personal details such as name, email address, contact
        information, and usage data to provide and improve our services.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide, operate, and maintain our services.</li>
        <li>To improve, personalize, and expand our offerings.</li>
        <li>To communicate with you regarding updates or promotions.</li>
        <li>To prevent fraudulent activities and ensure security.</li>
      </ul>

      <h2>3. Sharing of Data</h2>
      <p>
        We do not sell or rent your personal information. Data may be shared
        with trusted service providers strictly for operational purposes.
      </p>

      <h2>4. Security of Data</h2>
      <p>
        We implement strong measures to protect your data. However, no online
        transmission is 100% secure.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You have the right to access, update, or delete your personal data by
        contacting us.
      </p>

      <h2>6. Updates to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be
        posted on this page with a revised date.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        If you have questions, reach out at: <strong>snow@snowstrom.shop</strong>
      </p>
    </div>
  );
};

export default PrivacyPolicy;