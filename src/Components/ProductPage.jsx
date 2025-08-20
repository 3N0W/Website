// src/Components/ProductPage.jsx
import React, { useEffect, useState, useRef } from "react";
import img1 from "../Images/P.png";
import img2 from "../Images/LIFE.png";
import EmailCapture from "./EmailCapture";
import "./ProductPage.css";
import dotenv from "dotenv";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
dotenv.config();
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_R6bB1GOrVnKh8K";

/**
 * Frontend product list (UI only). Backend must have matching product IDs.
 * Prices shown here are UI-only; backend enforces real prices.
 */
const products = [
  { id: "prod_1", src: img1, name: "Why (Philosophy of Rejecting)", price: 299 },
  { id: "prod_2", src: img2, name: "Life of a dot (Sequence of Consequences)", price: 299 },
];

export default function ProductPage() {
  const [user, setUser] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { if (isMounted.current) setScriptLoaded(true); };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast.error("Payment gateway failed to load. Try again later.", { style: toastStyle(), position: "bottom-center" });
    };
    document.body.appendChild(script);
  }, []);

  const toastStyle = (overrides = {}) => ({
    borderRadius: "12px",
    background: "#0f0f11",
    color: "#e6eef0",
    padding: "12px 16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
    ...overrides
  });

  async function createOrder(productId) {
    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, buyer: { name: user.name, email: user.email } })
    });
    if (!res.ok) {
      const msg = await safeJsonError(res);
      throw new Error(msg || "Failed to create order");
    }
    return res.json();
  }

  async function verifyPayment(response) {
    const res = await fetch(`${API_BASE}/api/payment/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response)
    });
    if (!res.ok) {
      const msg = await safeJsonError(res);
      throw new Error(msg || "Failed to verify payment");
    }
    return res.json();
  }

  async function safeJsonError(res) {
    try {
      const data = await res.json();
      if (data?.error) return data.error;
      if (data?.message) return data.message;
      return JSON.stringify(data);
    } catch {
      return `${res.status} ${res.statusText}`;
    }
  }

  const handlePayment = async (product) => {
    if (!user) {
      toast.error("Enter your name and email first.", { style: toastStyle(), position: "bottom-center" });
      return;
    }
    if (!scriptLoaded) {
      toast.error("Payment gateway still loading. Wait a second.", { style: toastStyle(), position: "bottom-center" });
      return;
    }

    setLoadingProduct(product.id);

    try {
      const order = await createOrder(product.id);
      if (!order?.id) throw new Error("Invalid order response from server");

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Snow Strom Products",
        description: product.name,
        order_id: order.id,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#ff1a1a" },
        handler: async function (razorpayResponse) {
          toast.loading("Verifying payment...", { id: "verify", style: toastStyle(), position: "bottom-center" });
          try {
            const verifyData = await verifyPayment(razorpayResponse);
            toast.dismiss("verify");
            if (verifyData.success && verifyData.downloadUrl) {
              toast.success("Payment verified — starting download", { style: { ...toastStyle(), color: "#bfffbf" }, position: "bottom-center" });
              window.location.href = verifyData.downloadUrl;
            } else {
              toast.error("Payment verification failed.", { style: toastStyle(), position: "bottom-center" });
              console.error("Verify failed:", verifyData);
            }
          } catch (err) {
            toast.dismiss("verify");
            toast.error(err.message || "Verification error", { style: toastStyle(), position: "bottom-center" });
            console.error("Verification error:", err);
          } finally {
            if (isMounted.current) setLoadingProduct(null);
          }
        },
        modal: {
          ondismiss: function () {
            if (isMounted.current) setLoadingProduct(null);
            toast("Checkout closed", { icon: "✖️", style: toastStyle(), position: "bottom-center" });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment flow error:", err);
      toast.error(err.message || "Payment setup failed", { style: toastStyle(), position: "bottom-center" });
      setLoadingProduct(null);
    }
  };

  return (
    <div className="product-page-root">
      <Toaster />
      {!user && <EmailCapture onSubmit={setUser} />}

      <div className="p-page">
        {products.map((product) => (
          <div className="product-box" key={product.id}>
            <img src={product.src} alt={product.name} className="product-img" />
            <div className="product-meta">
              <h3>{product.name}</h3>
              <p className="price">₹{product.price}</p>
            </div>

            <div className="buy-button">
              <button
                className="collect-btn"
                onClick={() => handlePayment(product)}
                disabled={!!loadingProduct}
                aria-disabled={!!loadingProduct}
              >
                {loadingProduct === product.id ? "Processing…" : "Collect Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}