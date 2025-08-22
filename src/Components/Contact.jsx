import React from "react";

export default function Contact() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p className="mb-2">Email: <a href="mailto:snow@snowstrom.shop" className="text-red-400">snow@snowstrom.shop</a></p>
      <p className="mb-2">Phone: +91-7906052800</p>
      <p className="mb-2">Address: Fardpur Road, Mainpuri, Uttar Pradesh, India</p>
      <p className="mt-6 text-gray-400 text-sm">
        For any product or payment-related issues, reach us via email or phone.
      </p>
    </div>
  );
}