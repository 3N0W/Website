import React from "react";

export default function RefundPolicy() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Cancellation & Refund Policy</h1>
      <p className="mb-4">
        All sales of digital products are <strong>final</strong>. Once a product has been delivered, 
        cancellations or refunds will not be processed.
      </p>
      <p className="mb-4">
        If you encounter any issues accessing your purchase, please contact us at: 
        <a href="mailto:snow@snowstrom.shop" className="text-red-400"> support@snowstrom.shop</a>.
      </p>
      <p className="text-gray-400 text-sm">
        We reserve the right to amend this policy at any time.
      </p>
    </div>
  );
}