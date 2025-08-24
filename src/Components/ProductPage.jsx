// src/Components/ProductPage.jsx
import React, { useState, useEffect } from "react";
import EmailCapture from "./EmailCapture";
import "./ProductPage.css";
import prod1Img from "../Images/prod1.png";
import prod2Img from "../Images/prod2.png";

export default function ProductPage() {
  const [buyer, setBuyer] = useState(() => {
    const savedName = localStorage.getItem("buyer_name");
    const savedEmail = localStorage.getItem("buyer_email");
    return savedName && savedEmail ? { name: savedName, email: savedEmail } : null;
  });

  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // auto-detect backend (localhost in dev, live in prod)
  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : window.location.origin; // same domain in prod

  const products = [
    {
      id: "prod_1",
      name: "The Life of a Dot",
      price: 299,
      image: prod1Img,
      description: "Bibliography of a dot learning. The quote is Sequence of Consequences",
    },
    {
      id: "prod_2",
      name: "WHY?",
      price: 299,
      image: prod2Img,
      description: "The philosophy of standing against what we approve",
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

      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, buyer, affiliate }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Order not created");

      openRazorpayCheckout(data.data, productId);
    } catch (err) {
      console.error(err);
      alert("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (order, productId) => {
    const product = products.find((p) => p.id === productId);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ frontend key from .env
      amount: order.amount,
      currency: order.currency,
      name: "Zorgath Store",
      description: product.name,
      order_id: order.id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setDownloadUrl(verifyData.data.downloadUrl);
          } else {
            alert("Payment verification failed");
          }
        } catch (err) {
          console.error(err);
          alert("Payment verification failed");
        }
      },
      prefill: { email: buyer.email, name: buyer.name },
      theme: { color: "#ff1a1a" },
    };

    console.log("🔑 Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID); // debug
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Ensure Razorpay script is loaded
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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