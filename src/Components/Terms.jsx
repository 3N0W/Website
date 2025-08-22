import React from "react";
import "./d.css";

export default function Terms() {
  return (
    <div className="p-8 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <p className="mb-4">
        By using <strong>snowstrom.shop</strong> and purchasing our products, you agree to the following terms:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>All payments must be completed before product delivery.</li>
        <li>Digital product sales are final. No cancellations or refunds.</li>
        <li>Misuse, redistribution, or resale of products is strictly prohibited.</li>
        <li>We are not liable for any damages resulting from use or misuse of products.</li>
      </ul>
      <p className="mb-4">
        These terms are governed by Indian law. All disputes shall be subject to the jurisdiction of Delhi courts only.
      </p>
      <p className="text-gray-400 text-sm">
        We may update these Terms & Conditions at any time without prior notice.
      </p>
    </div>
  );
}