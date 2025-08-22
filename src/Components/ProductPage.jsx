// src/Components/ProductPage.jsx
import React, { useState } from "react";
import EmailCapture from "./EmailCapture";
import "./ProductPage.css";
import prod1Img from "../Images/prod1.png";
import prod2Img from "../Images/prod2.png";


export default function ProductPage() {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const products = [
  { id: "prod_1", name: "Product 1", price: 299, image: prod1Img },
  { id: "prod_2", name: "Product 2", price: 299, image: prod2Img },
];

  const handleBuy = async (productId) => {
    if (!buyer) {
      alert("Enter your name and email first!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, buyer }),
      });
      const data = await res.json();
      if (!data.id) throw new Error("Order not created");
      openRazorpayCheckout(data, productId);
    } catch (err) {
      console.error(err);
      alert("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (order, productId) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Zorgath Store",
      description: products.find((p) => p.id === productId).name,
      order_id: order.id,
      handler: async function (response) {
        const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) setDownloadUrl(verifyData.downloadUrl);
        else alert("Payment verification failed");
      },
      prefill: { email: buyer.email, name: buyer.name },
      theme: { color: "#ff1a1a" },
    };
    new window.Razorpay(options).open();
  };

  return (
    <div className="product-page-root">
      <h1 className="page-title">Products</h1>

      {!buyer && <EmailCapture onSubmit={setBuyer} />}

      <div className="products-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <img src={p.image} alt={p.name} className="product-image" />
            <h2 className="product-name">{p.name}</h2>
            <p className="product-price">₹{p.price}</p>
            <button
              className="buy-button"
              onClick={() => handleBuy(p.id)}
              disabled={loading || !buyer}
            >
              {loading ? "Processing..." : "Buy"}
            </button>
          </div>
        ))}
      </div>

      {downloadUrl && (
        <div className="download-section">
          <a href={downloadUrl} className="download-button">
            Download Product
          </a>
        </div>
      )}
    </div>
  );
}