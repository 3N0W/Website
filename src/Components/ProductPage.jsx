// src/Components/ProductPage.jsx
import React, { useState, useEffect } from "react";
import EmailCapture from "./EmailCapture";
import "./ProductPage.css";
import prod1Img from "../Images/prod1.png";
import prod2Img from "../Images/prod2.png";

export default function ProductPage() {
  // Load buyer info from localStorage initially
  const [buyer, setBuyer] = useState(() => {
    const savedName = localStorage.getItem("buyer_name");
    const savedEmail = localStorage.getItem("buyer_email");
    if (savedName && savedEmail) return { name: savedName, email: savedEmail };
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const products = [
    {
      id: "prod_1",
      name: "The Life of a Dot",
      price: 299,
      image: prod1Img,
      description:
        "Bibliography of a dot learning. The quote is Sequence of Consequences ",
    },
    {
      id: "prod_2",
      name: "WHY?",
      price: 299,
      image: prod2Img,
      description:
        "The philosophy of stabding against what we approve",
    },
  ];

  const handleBuy = async (productId) => {
    if (!buyer) {
      alert("Enter your name and email first!");
      return;
    }

    setLoading(true);
    try {
      const affiliate = localStorage.getItem("affiliate_code");

      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          buyer,
          affiliate,
        }),
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
        try {
          const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) setDownloadUrl(verifyData.downloadUrl);
          else alert("Payment verification failed");
        } catch (err) {
          console.error(err);
          alert("Payment verification failed");
        }
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
            <p className="product-description">{p.description}</p>
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